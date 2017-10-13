let JwtStrategy = require('passport-jwt').Strategy;
let ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = function (passport, userModel, env, cookieParser) {
  let opts = {};
  opts.secretOrKey = env.global_secret;
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.algorithms = [env.hash_algorithm];
  passport.use(new JwtStrategy(opts, function (jwtPayload, done) {
    if (jwtPayload) {
      userModel.model.findOneByID(jwtPayload.user, function (err, result) {
        if (err) {
          return done(err, false);
        } else {
          return done(null, result);
        }
      });
    } else {
      done(null, false);
    }
  }));
}
