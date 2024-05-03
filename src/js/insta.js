import Instafeed from 'instafeed.js';

window.insta = function () {
  return {
    init() {
      var feed = new Instafeed({
        accessToken:
          'IGQWROWFhaMFExUUZA4VXYtbkt1SnFVR2gyVENySWxzQk8tSEtOYnFrNXdSS0JDRlVSbk9hRlRCYkVLOHFtLXY2Uno0aTA1NENaa0JCWmR1U2toZAm1hSmt4eEhwcFNVRms1S2VpTEhrbW4wTk1fUGVxX3lHUHJVcG8ZD',
        limit: 4,
        template:
          '<a aria-label="instagram post" class="block w-full" href="{{link}}"><img class="w-full" title="{{caption}}" src="{{image}}" alt="{{caption}}" /></a>',
      });

      feed.run();
    },
  };
};
