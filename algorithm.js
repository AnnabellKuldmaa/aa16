// returns DTW distance matrix between A and B
// metrics
// 0 - Manhattan distance (simply abs value)
// 1 - Euclidean distance (need to take sqrt only from d[m-1][n-1])
// 2 - Canberra distance
// 3 - Minkowski distance with p = 3
// window
// 0 - whole plane
// 1 - Sakoe Chiba Band
// 2 - Itakura parallelogram
// window_param - size of window
// window_param - parameter size for Sakoe Chiba and Itakura

dynamicTimeWarping = function (A, B, metric, window, window_param) {
    var m = A.length; //rows
    var n = B.length; //columns
    var startX = 100;
    var startY = 100;
    var box_w = (n < 26 && m < 26) ? 25 : 10;
    var step = box_w;

    var d = [];
    for (var i = 0; i < m; i++) {
        var row = [];
        for (var s = 0; s < n; s++)
            row.push({value: 0, x: (startX + s * step), y: (startY + i * step)});
        d.push(row);
    }
    d[0][0].value = Math.abs(A[0] - B[0]);
    for (var j = 1; j < m; j++) {
        if (metric == 0)
            d[j][0].value = Math.abs(A[j] - B[0]) + d[j - 1][0].value;
        else if (metric == 1)
            d[j][0].value = Math.pow(A[j] - B[0], 2) + d[j - 1][0].value;
        else if (metric == 2)
            d[j][0].value = Math.round(Math.abs(A[j] - B[0]) / (Math.abs(A[j]) + Math.abs(B[0])), 2) + d[j - 1][0].value;
        else if (metric == 3)
            d[j][0].value = Math.pow(Math.abs(A[j] - B[0]), 3) + d[j - 1][0].value;
    }
    for (var k = 1; k < n; k++) {
        if (metric == 0)
            d[0][k].value = Math.abs(B[k] - A[0]) + d[0][k - 1].value;
        else if (metric == 1)
            d[0][k].value = Math.pow(B[k] - A[0], 2) + d[0][k - 1].value;
        else if (metric == 2)
            d[0][k].value = Math.round(Math.abs(B[k] - A[0]) / (Math.abs(B[k]) + Math.abs(A[0])), 2) + d[0][k - 1].value;
        else if (metric == 3)
            d[0][k].value = Math.pow(Math.abs(B[k] - A[0]), 3) + d[0][k - 1].value;

    }
    // must have m = n?
    // Sakoe Chiba Band: max window_param = m/2-1
    // Fill only the columns that satisfy |r-t| <= window_param, otherwise set to Infinity
    if (window == 1) {
        for (var r = 0; r < m; r++) {
            for (var t = 0; t < n; t++) {
                if (Math.abs(r - t) > window_param)
                    d[r][t].value = Infinity;
            }
        }
    }
    // Itakura parallelogram
    else if (window == 2) {
        for (var r = 0; r < m; r++) {
            for (var t = 0; t < n; t++) {
                if (itakura(r, t, m, n))
                    d[r][t].value = Infinity;
            }
        }
    }
    console.log(d);
    //calculate only for window
    if (window == 0) {
        for (var l = 1; l < m; l++) {
            for (var p = 1; p < n; p++) {
                var dist = 0;
                if (metric == 0)
                    dist = Math.abs(A[l] - B[p]);
                else if (metric == 1)
                    dist = Math.pow(A[l] - B[p], 2);
                else if (metric == 2)
                    dist = Math.round(Math.abs(B[l] - A[p]) / (Math.abs(B[l]), 2) + Math.abs(A[p]));
                else if (metric == 3)
                    dist = Math.pow(Math.abs(A[l] - B[p]), 3);
                // min(diagonal, up, left)
                d[l][p].value = dist + Math.min(d[l - 1][p - 1].value, d[l - 1][p].value, d[l][p - 1].value);
            }
        }
    }
    else if (window == 1) {
        for (var l = 1; l < n; l++) {
            for (var p = Math.max(l - window_param, 1); p < Math.min(m, window_param + 1); p++) {
                if (metric == 0)
                    dist = Math.abs(A[l] - B[p]);
                else if (metric == 1)
                    dist = Math.pow(A[l] - B[p], 2);
                else if (metric == 2)
                    dist = Math.round(Math.abs(B[l] - A[p]) / (Math.abs(B[l]), 2) + Math.abs(A[p]));
                else if (metric == 3)
                    dist = Math.pow(Math.abs(A[l] - B[p]), 3);
                // min(diagonal, up, left)
                d[l][p].value = dist + Math.min(d[l - 1][p - 1].value, d[l - 1][p].value, d[l][p - 1].value);
            }
        }
    }
    else if (window == 2) {
        for (var l = 1; l < m; l++) {
            for (var p = 1; p < n; p++) {
                if (itakura(l, p, m, n)) {
                    if (metric == 0)
                        dist = Math.abs(A[l] - B[p]);
                    else if (metric == 1)
                        dist = Math.pow(A[l] - B[p], 2);
                    else if (metric == 2)
                        dist = Math.round(Math.abs(B[l] - A[p]) / (Math.abs(B[l]), 2) + Math.abs(A[p]));
                    else if (metric == 3)
                        dist = Math.pow(Math.abs(A[l] - B[p]), 3);
                    d[l][p].value = dist + Math.min(d[l - 1][p - 1].value, d[l - 1][p].value, d[l][p - 1].value);
                }
            }
        }
    }

    // distance is d[m-1][n-1] for Euclidean, Canberra need to take root
    var distance = d[m - 1][n - 1].value;
    if (metric == 1)
        distance = Math.round(Math.pow(distance, 1 / 2), 2);
    else if (metric == 3)
        distance = Math.round(Math.pow(distance, 1 / 3), 2);
    return {"data": d, "distance": distance};
}
;

// returns warping path given cost matrix
warpingPath = function (d) {
    var i = d.length - 1; //row
    var j = d[0].length - 1;//column
    var box_w = (d.length < 26 && d[0].length < 26) ? 25 : 10;
    var path = Array();
    console.log(d);
    //path.push([i,j]);
    path.push([d[i][j].x + box_w, d[i][j].y + box_w]); // so that the line starts from the bottom corner
    path.push([d[i][j].x, d[i][j].y]);
    while (i > 0 || j > 0) {
        console.log(i);
        console.log(j);
        if (i == 0)
            j = j - 1;
        else if (j == 0)
            i = i - 1;
        else {
            if (d[i - 1][j].value == Math.min(d[i - 1][j - 1].value, d[i - 1][j].value, d[i][j - 1].value))
                i = i - 1;
            else if (d[i][j - 1].value == Math.min(d[i - 1][j - 1].value, d[i - 1][j].value, d[i][j - 1].value))
                j = j - 1;
            else {
                i = i - 1;
                j = j - 1;
            }
        }

        //path.push([j, i]);
        path.push([d[j][i].x, d[j][i].y]);
    }
    //path.push([0,0]);
    path.push([d[0][0].x, d[0][0].y]);
    return path;
}
;
// TODO: check if correct: n and m must be switched?
// returns true if out of window
itakura = function (i, j, n, m) {
    return (j < 2 * i) && (i <= 2 * j) && (i >= n - 1 - 2 * (m - j)) && (j > m - 1 - 2 * (n - i));
};