module.exports = async function (context) {
    context.res.json({
        time: get_time()
    });
};

function get_time(){
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth()+1;
    var date = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    return (
        year + "/" + 
        month + "/" +
        date + " " +
        hour + ":" +
        minute
    );
}