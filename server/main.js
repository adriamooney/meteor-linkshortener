import { Meteor } from 'meteor/meteor';
import { Links } from '../imports/collections/links';
import { WebApp } from 'meteor/webapp';
import ConnectRoute from 'connect-route';

Meteor.startup(() => {
  // code to run on server at startup
  Meteor.publish('links', function() {
      return Links.find({});
  });
});
//this is nodejs middleware (ConnectRoute is similar to express):

// executed whenever a user visits with a route localhost:3000.asdf
function onRoute(req, res, next) {
    //take the token out of the URL and find a matching
    //link in the Links collection
    const link = Links.findOne({token: req.params.token});
    //if we find a link object, redirect to the long url
    if(link) {

      //update db with clicks
      //don't need to use meteor method, because
      //we are already on the server.  we can just update
      //the db directly:
      Links.update(link, {$inc: {clicks: 1}});

      res.writeHead(307, {'Location':link.url});
      res.end();
    }
    //otherwise send user to React app
    else {
      next();
    }
}

const middleware = ConnectRoute(function(router) {
    router.get('/:token', onRoute);
});

WebApp.connectHandlers
  .use(middleware);
