import Instafeed from 'instafeed.js';

window.insta = function () {
  return {
    init() {
      var feed = new Instafeed({
        userId: 'garethj.world',
        accessToken:
          'IGQWRQV2JpcDdJOGpYdW0zWC1abUxGczRFVU5DSW05Y3FIMmY4SmpNTmpzckZA2ckE4WGxUVmZAYSWZAtQ0k5RTRxemh3Tk5jT3RNamFHUS1sWURTVEZAnT0t0V1MyaWY5Q2RReUxfVUl4cXNDcVoxSnZACeE5ZAcnlBaGsZD',
      });
      feed.run();
    },
  };
};
