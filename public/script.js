var timeConverter = (UNIX_timestamp) => {
  var a = new Date(UNIX_timestamp);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();

  var min = a.getMinutes();
  min = (min.toString().length === 1) ? ('0'+min) : min;

  var sec = a.getSeconds();
  sec = (sec.toString().length === 1) ? ('0'+sec) : sec;

  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
};

var Tweet = React.createClass({

  render: function () {
    const {id, text, reps, favs, rets, handleReply, handleFavorite, handleRetweet, handleOther} = this.props;
    return (
      <table className="tweet">
        <tbody>
          <tr className="tweetdate">
            Anon @ {timeConverter(id)}
          </tr>
          <tr className="tweettext">
            {text}
          </tr>
        </tbody>
        <tbody>
          <tr className="tweetbuttons">
            <td>
              {reps}<button type="button" onClick={()=>handleReply(id)}> Reply</button>
            </td>
            <td>
              {favs}<button type="button" onClick={()=>handleFavorite(id)}> Favorite</button>
            </td>
            <td>
              {rets}<button type="button" onClick={()=>handleRetweet(id)}> Retweet</button>
            </td>
            <td>
              <button type="button" onClick={()=>handleOther(id)}> Other</button>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
});

var TweetBox = React.createClass({

  loadTweetsFromFile: function () {
    const {url} = this.props;
    $.ajax({
      url: url,
      dataType: 'json',
      cache: false,
      success: (data) => {
        this.setState({data: data});
      },
      error: (xhr, status, err) => {
        console.error(url, status, err.toString());
      }
    });
  },

  handleTweetSubmit: function (text) {
    const {url} = this.props;
    var tweets = this.state.data;
    var tweet = {
      text: text,
      id: Date.now(),
      favs: 0,
      rets: 0,
      reps: 0
    };

    var newTweets = tweets.concat([tweet]);
    this.setState({data: newTweets});
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'POST',
      data: tweet,
      success: (data) => {
        this.setState({data: data});
      },
      error: (xhr, status, err) => {
        this.setState({data: tweets});
        console.error(url, status, err.toString());
      }
    });
  },

  handleUpdate: function (tweetID, property) {

    var newTweets = this.state.data.map((tweet) => {
      if(tweet.id === tweetID){
        if(property === 'all'){
          return Object.assign({}, tweet,
            {reps: +tweet.reps + 1,
              favs: +tweet.favs + 1,
              rets: +tweet.rets + 1});
        } else {
          return Object.assign({}, tweet, {[property]: +tweet[property] + 1});
        }
      } else {
        return Object.assign({}, tweet, {});
      }
    });
    this.setState({data: newTweets});
  },

  handleReply: function (tweetID) {
    this.handleUpdate(tweetID, 'reps');
  },

  handleFavorite: function (tweetID) {
    this.handleUpdate(tweetID, 'favs');
  },
  handleRetweet: function (tweetID) {
    this.handleUpdate(tweetID, 'rets');
  },

  handleOther: function (tweetID) {
    this.handleUpdate(tweetID, 'all');
  },

  getInitialState: function () {
    return {data: []};
  },

  componentDidMount: function () {
    this.loadTweetsFromFile();
  },

  render: function () {
    return (
      <div className="tweetBox">
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

  render: function () {
    const {handleReply, handleFavorite, handleRetweet, handleOther} = this.props;
    var tweetNodes = this.props.data.map((tweet) => {
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
      <div className="tweetList">
        {tweetNodes}
      </div>
    );
  }
});

var TweetForm = React.createClass({
  getInitialState: function () {
    return {text: ''};
  },
  handleTextChange: function (e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function (e) {
    e.preventDefault();
    var text = this.state.text.trim();
    if (!text) {
      return;
    }
    this.props.onTweetSubmit(text);
    this.setState({text: ''});
  },
  render: function () {
    return (
      <form className="tweetForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Start typing..."
          value={this.state.text}
          onChange={this.handleTextChange}
        />
        <input type="submit" value="Tweet!"/>
      </form>
    );
  }
});

var App = React.createClass({
  render: function () {
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