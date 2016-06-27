var Tweet = React.createClass({

    render: function() {
        const {id, text, reps, favs, rets, handleReply, handleFavorite, handleRetweet, handleOther} = this.props;
        return (
                <div className="tweet">
                    <tr>
                        <h3>{text}</h3>
                    </tr>
                    <tr>
                        <td>
                            <h4>{reps} <button type="button" onClick={()=>handleReply(id)}> Reply </button></h4>
                        </td>
                        <td>
                            <h4>{favs} <button type="button" onClick={()=>handleFavorite(id)}> Favorite </button></h4>
                        </td>
                        <td>
                            <h4>{rets} <button type="button" onClick={()=>handleRetweet(id)}> Retweet </button></h4>
                        </td>
                        <td>
                            <h4>{rets+reps+favs} <button type="button" onClick={()=>handleOther(id)}> Other </button></h4>
                        </td>
                    </tr>
                </div>
        );
    }
});

var TweetBox = React.createClass({

    loadTweetsFromFile: function() {
        const {url} = this.props;
        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(url, status, err.toString());
            }.bind(this)
        });
    },

    handleTweetSubmit: function(tweet) {
        const {url} = this.props;

        var tweets = this.state.data;
        tweet.id = Date.now();
        tweet.favs = 0;
        tweet.rets = 0;
        tweet.reps = 0;
        var newTweets = tweets.concat([tweet]);
        this.setState({data: newTweets});
        $.ajax({
            url: url,
            dataType: 'json',
            type: 'POST',
            data: tweet,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({data: tweets});
                console.error(url, status, err.toString());
            }.bind(this)
        });
    },

    handleUpdate: function (tweetID, property) {
        var tweets = this.state.data;
        _.mapObject(tweets, function(val, key){
            if(val.id === tweetID){
                if(property != 'all'){
                    val.property += 1;
                } else {
                    val.reps += 1;
                    val.favs += 1;
                    val.rets += 1;
                }
            }
            return val;
        });
        this.setState(tweets);
    },

    handleReply: function(tweetID){
        this.handleUpdate(tweetID, 'reps');
    },

    handleFavorite: function(tweetID){
        this.handleUpdate(tweetID, 'favs');
    },
    handleRetweet: function(tweetID){
        this.handleUpdate(tweetID, 'rets');
    },

    handleOther: function(tweetID){
        this.handleUpdate(tweetID, 'all');
    },

    getInitialState: function() {
        return {data: []};
    },

    componentDidMount: function() {
        this.loadTweetsFromFile();
    },

    render: function() {
        return (
            <div className="tweetBox" >
                <h2>Tweets</h2>
                <TweetList
                    data={this.state.data}
                    handleReply={this.handleReply}
                    handleFavorite={this.handleFavorite}
                    handleRetweet={this.handleRetweet}
                    handleOther={this.handleOther}
                />
                <TweetForm
                    onTweetSubmit={this.handleTweetSubmit}
                />
            </div>
        );
    }
});

var TweetList = React.createClass({

    render: function() {
        const {handleReply, handleFavorite, handleRetweet, handleOther} = this.props;
        var tweetNodes = this.props.data.map(function(tweet) {
            const {id, text, reps, favs, rets} = tweet;

            return (
                <Tweet
                    key={id} id={id} text={text} favs={favs} reps={reps} rets={rets}
                    handleReply={handleReply}
                    handleFavorite={handleFavorite}
                    handleRetweet={handleRetweet}
                    handleOther={handleOther}
                />
            );
        });
        return (
            <div className="tweetList" >
                {tweetNodes}
            </div>
        );
    }
});

var TweetForm = React.createClass({
    getInitialState: function() {
        return {text: ''};
    },
    handleTextChange: function(e) {
        this.setState({text: e.target.value});
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var text = this.state.text.trim();
        if (!text) {
            return;
        }
        this.props.onTweetSubmit({text: text});
        this.setState({text: ''});
    },
    render: function() {
        return (
            <form className="tweetForm" onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    placeholder="Start typing..."
                    value={this.state.text}
                    onChange={this.handleTextChange}
                />
                <input type="submit" value="Tweet!" />
            </form>
        );
    }
});

var App = React.createClass({
    render: function() {
        return (
            <div>
                <div className='row'>
                    <h1>Twitter Clone</h1>
                </div>
                <div className='row'>
                    <div className='three columns'>
                        <h6>Drop down menu</h6>
                    </div>
                    <div className='nine columns'>
                        <TweetBox url="/api/tweets" pollInterval="{2000}"/>
                    </div>
                </div>
            </div>
        );
    }
});


ReactDOM.render(
    <App />,
    document.getElementById('app')
);