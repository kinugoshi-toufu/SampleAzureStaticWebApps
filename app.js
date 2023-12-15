$(function () {

    var AMEDAS_POINT = '46141'; // アメダス地点コード辻堂
    //var AMEDAS_POINT = '66446'; // アメダス地点コード倉敷
    var ELEM = 'wind'; // 表示要素
  
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
        ['00', '03', '06', '09', '12', '15', '18', '21'].forEach(function (th) {
          requests[yesterdayStr + th] = '//www.jma.go.jp/bosai/amedas/data/point/' + AMEDAS_POINT + '/' + yesterdayStr + th + '.json';
        });
        ['00', '03', '06', '09', '12', '15', '18', '21'].forEach(function (th) {
          if (Number(th) > baseTime.getUTCHours()) return;
          requests[baseStr + th] = '//www.jma.go.jp/bosai/amedas/data/point/' + AMEDAS_POINT + '/' + baseStr + th + '.json';
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
          // テーブル作成
          var table = $('<table>').appendTo('#target');
          $('<tr>')
            .appendTo(table)
            .append($('<th>').text('時刻'))
            .append($('<th>').text('気温'));
          Object.keys(merged).sort().forEach(function (timeStr) {
            var time = JMAWebUtility.date.createFromString(timeStr);
            $('<tr>')
              .appendTo(table)
              .append($('<td>').text(JMAWebUtility.date.strftime(time, '%Y/%m/%d %H:%M')))
              .append($('<td>').text(merged[timeStr][ELEM][0]));
          });

          // スタイルを追加してセルの間に余白を設定
          $('table td, table th').css('padding', '10px');
        });
      });
});