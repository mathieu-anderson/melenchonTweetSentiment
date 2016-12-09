var colors = require('colors')
var dotenv = require('dotenv')
var emoji = require('node-emoji')
var isUrl = require('is-url')
var request = require('superagent')
var Twitter = require('twitter')
var unirest = require('unirest')
var fs = require('fs')

// load environment variables
dotenv.config()

var translate = require('yandex-translate-api')(process.env.YANDEX_API_KEY)

// configure twitter client
var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});




// your twitter search code here
var params = {
    q: '#melenchon',
    count: 1,
    lang: "fr",
    result_type: "recent"
}

var tweetText = []

client.get('search/tweets', params, function getFrenchTweet(error, tweets, response) {

    if (error) {
        console.log(error)
    }

    tweetText = tweets.statuses.map(item => item.text)

    tweetText.forEach(function(tweet) {
        // translate.translate(tweet, {
        //     to: 'en'
        // }, function translateToEn(err, res) {
        //
        //     sentimentofTweet()
        //
        //     function sentimentofTweet() {

                unirest.post("https://japerk-text-processing.p.mashape.com/sentiment/")
                    .header("X-Mashape-Key", process.env.SENTIMENT_API_KEY)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .header("Accept", "application/json")
                    .send("text=" + tweet)
                    .end(function getTweetSentimentEmoji(result) {

                        fs.writeFile('melenchonTweet.js', "module.exports = { latestTweet : { " + tweet+ "}," + " sentiment : { Anaylse émotionnelle : " + result.body.label+"'}}", (err) => {
                            if (err) throw err;
                            console.log('It\'s saved!');
                        });

                        if (result.body.label === "pos") {
                            console.log(colors.green(tweet))
                            console.log(colors.green(colors.green(emoji.get('heart')), "Analyse émotionnelle : positive"),  colors.green(emoji.get('heart')))
                        } else if (result.body.label === "neg") {
                            console.log(colors.red(tweet))
                            console.log(colors.red(colors.red(emoji.get('skull')), "Analyse émotionnelle : négative"),  colors.red(emoji.get('skull')))
                        } else {
                            console.log(colors.gray(tweet))
                            console.log(colors.gray(colors.gray(emoji.get('expressionless')), "Analyse émotionnelle : neutre"),  colors.gray(emoji.get('expressionless')))
                        }

                    });
            // }
        // })

    })
})
