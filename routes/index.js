var express = require('express');
const request = require('request');
var router = express.Router();
var path = require('path');
var __dirname = path.resolve();

router.use(express.static(path.join(__dirname, 'public'),{index:false,extensions:['html']}));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'That More' });
});



/* API 이름 -> 채널ID */
router.get('/api/getchannel/:name', function (req, res) {
  let _name = req.params.name;

  get_channelId_by_name(_name, function(result) {
    if(result == '') {
      res.status(200).json({
        'channel_id': `none`
      });
    } else {
      res.status(200).json({
        'channel_id': `${result}`
      });
    }
  });
});

module.exports = router;


/* 검색어로 채널ID 가져오는 함수 **/
function get_channelId_by_name(searchName, callback) {
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    url: `https://www.youtube.com/results?search_query=${encodeURI(searchName)}`,
    method: 'GET',
  };

  request(options, function (error, response, body) {
    try {
      let var1 = body.split('browseId":"');
      let var2 = var1[3].split('"'); // 유튜브 광고 채널때문에 3번째 인덱스가 보통 잘잡히는듯
      const result = var2[0];
      callback(result);
    } catch (error) {
      console.log("[API getchannel 에러] - " + error);
      callback('');
    }
  });
}