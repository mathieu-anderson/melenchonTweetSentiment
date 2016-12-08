var colors = require('colors')
var dotenv = require('dotenv')
var emoji = require('node-emoji')
var isUrl = require('is-url')
var request = require('superagent')
var Twitter = require('twitter')
var unirest = require('unirest')

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
    count: 10,
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
        translate.translate(tweet, {
            to: 'en'
        }, function translateToEn(err, res) {

            sentimentofTweet()

            function sentimentofTweet() {

                unirest.post("https://japerk-text-processing.p.mashape.com/sentiment/")
                    .header("X-Mashape-Key", process.env.SENTIMENT_API_KEY)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .header("Accept", "application/json")
                    .send("text=" + res.text)
                    .end(function getTweetSentimentEmoji(result) {

                        if (result.body.label === "pos") {
                            console.log(colors.green(res.text))
                            console.log(colors.green(colors.green(emoji.get('heart')),"The sentiment of this tweet is"), colors.green(result.body.label), colors.green(emoji.get('heart')))
                        } else if (result.body.label === "neg") {
                            console.log(colors.red(res.text))
                            console.log(colors.red(colors.red(emoji.get('skull')),"The sentiment of this tweet is"), colors.red(result.body.label), colors.red(emoji.get('skull')))
                        } else {
                            console.log(colors.gray(res.text))
                            console.log(colors.gray(colors.gray(emoji.get('expressionless')),"The sentiment of this tweet is"), colors.gray(result.body.label), colors.gray(emoji.get('expressionless')))
                        }

                    });
            }
        })

    })
})
