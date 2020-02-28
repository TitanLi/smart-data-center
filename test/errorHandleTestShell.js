/*
功能：計算昨日消耗功率
預設時間標準：UTC
*/
db.upsPower_A.aggregate([
    {
        $match: {
            "time": {
                "$gte": new Date("2020-02-26T16:00:00Z"),
                "$lt": new Date("2020-02-27T15:59:59Z")
            }
        }
    },
    {
        $group: {
            _id: {
                $dateToString: {
                    format: "%G/%m/%d",
                    date: "$time",
                    timezone: "Asia/Taipei"
                }
            },
            power: {
                $avg: "$power"
            }
        }
    }
])

/*
功能：查詢昨日異常資料，並將time更改為台灣時間輸出
預設時間標準：UTC
*/
db.upsPower_A.aggregate([
    {
        $match: {
            "time": {
                "$gte": new Date("2020-02-26T16:00:00Z"),
                "$lt": new Date("2020-02-27T15:59:59Z")
            },
            "power": {
                "$gte": 10
            }
        }
    },
    {
        $project: {
            time: {
                $dateToString: {
                    format: "%G/%m/%d %H:%M:%S:%L%z",
                    date: "$time",
                    timezone: "Asia/Taipei"
                }
            },
            power: 1
        },
    }
])