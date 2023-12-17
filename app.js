$(function () {

  var AMEDAS_POINT = '46141'; // アメダス地点コード辻堂
  //var AMEDAS_POINT = '66446'; // アメダス地点コード倉敷
  var ELEM = 'temp'; // 表示要素

  // 現在の時刻取得
  var currentDateTime = new Date();

  // 最新時刻取得
  $.ajax({ url: '//www.jma.go.jp/bosai/amedas/data/latest_time.txt' })
    .done(function (txt) {
      // JSONのURL作成
      var baseTime = new Date(txt);
      var yesterday = new Date(baseTime);
      yesterday.setDate(yesterday.getDate() - 1);
      var baseStr = JMAWebUtility.date.strftime(baseTime, '%Y%m%d_');
      var yesterdayStr = JMAWebUtility.date.strftime(yesterday, '%Y%m%d_');
      var requests = {};

      // 過去のデータリクエスト
      ['00', '03', '06', '09', '12', '15', '18', '21'].forEach(function (th) {
        if (currentDateTime.getHours() >= Number(th)) {
          requests[baseStr + th] = '//www.jma.go.jp/bosai/amedas/data/point/' + AMEDAS_POINT + '/' + baseStr + th + '.json';
        }
      });

      // データの取得
      JMAWebUtility.parallelRequest(requests, function (data) {
        // ３時間ごとでは使いにくいので、１つにまとめる。
        var merged = {};
        Object.keys(data).forEach(function (fkey) {
          Object.keys(data[fkey]).forEach(function (timeStr) {
            merged[timeStr] = data[fkey][timeStr];
          });
        });

        // データが取得できたことをコンソールにログ出力
        console.log('取得したデータ:', merged);

        // グラフ描画
        drawTemperatureGraph(merged);
      });
    });

  // グラフ描画関数
  function drawTemperatureGraph(data) {
    var times = Object.keys(data).sort();
    var temperatures = times.map(function (timeStr) {
      return data[timeStr][ELEM][0];
    });

    // Canvasの取得
    var canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    document.getElementById('target').appendChild(canvas);

    var ctx = canvas.getContext('2d');

    // グラフの設定
    var chartConfig = {
      type: 'line',
      data: {
        labels: times,
        datasets: [{
          label: '気温',
          data: temperatures,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: false
        }]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              displayFormats: {
                minute: 'YYYY/MM/DD HH:mm'
              }
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    };

    // グラフの描画
    new Chart(ctx, chartConfig);
  }

});
