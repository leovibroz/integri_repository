const express = require('express');
const utils = require('../utils/promiseHandler');
const graph = require('fbgraph');
const FacebookStrategy = require('passport-facebook').Strategy;


module.exports = function (watson, dbHandler, userModel, passport, env) {
  let analyzePosts = function (posts) {
    return new Promise((resolve, reject) => {
      let translationList = posts.map(post => {
        return watson.translate(post.message)
      });
      Promise.all(translationList).then(response => {
        let analysisList = response.map(trans => {
          return watson.analyze(trans)
        })
        Promise.all(analysisList.map(utils.reflect)).then(analysis => {
          let categoriesList = [];
          let filterAnalysis = analysis.filter(item => {
            if (item.status === 'resolved') {
              item.v.categories.forEach(cat => {
                if (cat.score > 0.3) {
                  let query = cat.label.split('/');
                  categoriesList.push(query[query.length - 1])
                }
              })
              return item
            }
          });
          resolve(categoriesList)
        }).catch(err => {
          reject(err)
        })
      }).catch(err => {
        reject(err)
      })
    })
  }
  passport.use(new FacebookStrategy({
      clientID: env.facebookClientID,
      clientSecret: env.facebookClientSecret,
      callbackURL: env.facebookCallbackURL,
      enableProof: true
    },
    function (accessToken, refreshToken, profile, cb) {
      graph.setAccessToken(accessToken);
      dbHandler.view('profiles', 'getFacebookUsers', {
        keys: [profile.id]
      }, (err, body) => {
        if (body.rows.length > 0) {
          let user = body.rows[0].value;
          graph.get(profile.id + '?fields=id,name,posts,location,picture', (err, res) => {
            if (!err && res.posts) {
              user.profile_image = res.picture.data.is_silhouette ? '' : res.picture.data.url
              user.location = res.location ? res.location.name : ''
            }
            return cb(null, user);
          })
        } else {
          graph.get(profile.id + '?fields=id,name,posts,location,picture', (err, res) => {
            if (!err && res.posts) {
              console.log(res)
              let userObj = {
                id: res.id,
                name: res.name,
                posts: res.posts.data.filter(post => {
                  if (post.message) {
                    return true
                  }
                }),
                profile_image: res.picture.data.is_silhouette ? '' : res.picture.data.url,
                location: res.location ? res.location.name : '',
                like: []
              }
              let analysis = analyzePosts(userObj.posts)
              analysis.then(res => {
                res.forEach(sample => {
                  console.log(sample)
                  userObj.like.push(sample)
                });
                let user = userModel;
                user.like = userObj.like;
                user.medias.facebook = userObj.id;
                user.name = userObj.name;
                user.profile_image = userObj.profile_image;
                user.created_at = Date.now();
                user.last_change = Date.now();
                user.last_login = Date.now();
                user.location = userObj.location
                user.save((err) => {
                  if (err) {
                    return cb(null, profile);
                  } else {
                    return cb(null, user);
                  }
                })
              })
            } else {
              // This user has no posts
              console.log(res)
              let userObj = {
                id: res.id,
                name: res.name,
                profile_image: res.picture.data.is_silhouette ? '' : res.picture.data.url,
                location: res.location ? res.location.name : '',
                like: []
              }
              return cb(null, userObj);
            }
          })
        }
      })
    }));

  let api = express.Router();
  api.post('/analyze', (req, res) => {
    let posts = req.body.user_data.posts;
    let analysis = analyzePosts(posts)
    analysis.then(response => {
      res.json(response.data)
    }).catch(err => {
      res.status(500).json(response.data)
    })
  })

  api.get('/authenticate',
    passport.authenticate('facebook', {
      scope: ['user_posts', 'user_location', 'email']
    }));

  api.get('/login/return',
    passport.authenticate('facebook', {
      failureRedirect: '/#/login'
    }),
    function (req, res) {
      res.redirect('/');
    });

  return api
}
