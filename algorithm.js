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
// 3 - Slanted band (similar to Sakoe Chiba for  m!=n)
// window_param - parameter size for Sakoe Chiba
// in band calculation used code snippets from https://github.com/fbkarsdorp/dynamic-time-warping

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
            row.push({value: 0, x: (startX + s * step), y: (startY + i * step), i: i, j: s, formula:""});
        d.push(row);
    }
    if (!(window == 3)) {
        if (metric == 0){
            d[0][0].value = Math.abs(A[0] - B[0]);
            d[0][0].formula = 'd[0,0] = dist(0,0) = ' + d[0][0].value;
        }
        else if (metric == 1) {
            d[0][0].value = Math.pow(A[0] - B[0], 2);
            d[0][0].formula = 'd[0,0] = dist(0,0) = ' + d[0][0].value;
        }
        else if (metric == 2) {
            d[0][0].value = +((Math.abs(A[0] - B[0]) / (Math.abs(A[0]) + Math.abs(B[0]))).toFixed(3));
            d[0][0].formula = 'd[0,0] = dist(0,0) = ' + d[0][0].value;
        }
        else if (metric == 3) {
            d[0][0].value = Math.pow(Math.abs(A[0] - B[0]), 3);
            d[0][0].formula = 'd[0,0] = dist(0,0) = ' + d[0][0].value;
        }
        for (var j = 1; j < m; j++) {
            if (metric == 0) {
                d[j][0].value = Math.abs(A[j] - B[0]) + d[j - 1][0].value;
                d[j][0].formula = 'd['+j+',0] = dist('+j+',0)+d['+ (j-1) + ',0] = ' + Math.abs(A[j] - B[0]) + '+' + d[j - 1][0].value + ' = ' + d[j][0].value;
            }
            else if (metric == 1) {
                d[j][0].value = Math.pow(A[j] - B[0], 2) + d[j - 1][0].value;
                d[j][0].formula = 'd['+j+',0] = dist('+j+',0)+d['+ (j-1) + ',0] = ' +  Math.pow(A[j] - B[0], 2) + '+' + d[j - 1][0].value + ' = ' + d[j][0].value;
            }
            else if (metric == 2) {
                d[j][0].value = +(((Math.abs(A[j] - B[0]) / (Math.abs(A[j]) + Math.abs(B[0]))) + d[j - 1][0].value).toFixed(3));
                d[j][0].formula = 'd['+j+',0] = dist('+j+',0)+d['+ (j-1) + ',0] = ' +Math.abs(A[j] - B[0]) / (Math.abs(A[j]) + Math.abs(B[0])) + '+' + d[j - 1][0].value + ' = ' + d[j][0].value;
            }
            else if (metric == 3) {
                d[j][0].value = Math.pow(Math.abs(A[j] - B[0]), 3) + d[j - 1][0].value;
                d[j][0].formula = 'd['+j+',0] = dist('+j+',0)+d['+ (j-1) + ',0] = ' + Math.pow(Math.abs(A[j] - B[0]), 3) + '+' + d[j - 1][0].value + ' = ' + d[j][0].value;
            }
        }
        for (var k = 1; k < n; k++) {
            if (metric == 0) {
                d[0][k].value = Math.abs(B[k] - A[0]) + d[0][k - 1].value;
                d[0][k].formula = 'd[0,'+k+'] = dist(0,'+k+')+d[0,'+(k-1) + '] = '+Math.abs(B[k] - A[0]) + '+' + d[0][k - 1].value + ' = ' + d[0][k].value;
            }
            else if (metric == 1) {
                d[0][k].value = Math.pow(B[k] - A[0], 2) + d[0][k - 1].value;
                d[0][k].formula = 'd[0,'+k+'] = dist(0,'+k+')+d[0,'+(k-1) + '] = '+Math.pow(B[k] - A[0], 2)+ '+' + d[0][k - 1].value + ' = ' + d[0][k].value;
            }
            else if (metric == 2) {
                d[0][k].value = +(((Math.abs(A[0] - B[k]) / (Math.abs(A[0]) + Math.abs(B[k]))) + d[0][k-1].value).toFixed(3));
                d[0][k].formula = 'd[0,'+k+'] = dist(0,'+k+')+d[0,'+(k-1) + '] = ' + Math.abs(B[k] - A[0]) / (Math.abs(B[k]) + Math.abs(A[0]))+ '+' + d[0][k - 1].value + ' = ' + d[0][k].value;
            }
            else if (metric == 3) {
                d[0][k].value = Math.pow(Math.abs(B[k] - A[0]), 3) + d[0][k - 1].value;
                d[0][k].formula = 'd[0,'+k+'] = dist(0,'+k+')+d[0,'+(k-1) + '] = ' + Math.pow(Math.abs(B[k] - A[0]), 3)+ '+' + d[0][k - 1].value+ ' = ' + d[0][k].value;
            }
        }
    }
    // must have m = n?
    // Sakoe Chiba Band
    // Fill only the columns that satisfy |r-t| <= window_param, otherwise set to Infinity
    if (window == 1) {
        for (var r = 0; r < m; r++) {
            for (var t = 0; t < n; t++) {
                if (Math.abs(r - t) > parseInt(window_param)) {
                    d[r][t].value = Infinity;
                    d[r][t].formula = 'd[' + r + ',' + t + '] = ' + d[r][t].value;
                }
            }
        }
    }
    // Itakura parallelogram
    else if (window == 2) {
        for (var r = 0; r < m; r++) {
            for (var t = 0; t < n; t++) {
                if (!(itakura(r + 1, t + 1, m, n))) {
                    d[r][t].value = Infinity;
                    d[r][t].formula = 'd[' + r + ',' + t + '] = ' + d[r][t].value;
                }
            }
        }
    }
    // Slanted band
    else if (window == 3) {
        // all values to Infinity
        for (var r = 0; r < m; r++) {
            for (var t = 0; t < n; t++) {
                d[r][t].value = Infinity;
                d[r][t].formula = 'd[' + r + ',' + t + '] = ' + d[r][t].value;
            }
        }
        var slant = n / m;
        for (var r = 0; r < m; r++) {
            var slant_r = Math.ceil(r * slant);
            for (var t = Math.max(slant_r - parseInt(window_param), 0); t < Math.min(n, slant_r + parseInt(window_param) + 1); t++) {
                if (r == 0 && t == 0) {
                    if (metric == 0) {
                        d[0][0].value = Math.abs(A[0] - B[0]);
                        d[0][0].formula = 'd[0,0] = dist(0,0) = ' + d[0][0].value;
                    }
                    else if (metric == 1) {
                        d[0][0].value = Math.pow(A[0] - B[0], 2);
                        d[0][0].formula = 'd[0,0] = dist(0,0) = ' + d[0][0].value;
                    }
                    else if (metric == 2) {
                        d[0][0].value = +((Math.abs(A[0] - B[0]) / (Math.abs(A[0]) + Math.abs(B[0]))).toFixed(3));
                        d[0][0].formula = 'd[0,0] = dist(0,0) = ' + d[0][0].value;
                    }
                    else if (metric == 3) {
                        d[0][0].value = Math.pow(Math.abs(A[0] - B[0]), 3);
                        d[0][0].formula = 'd[0,0] = dist(0,0) = ' + d[0][0].value;
                    }
                }
                else if (r == 0) {
                    //console.log(r,t)
                    if (metric == 0) {
                        d[0][t].value = Math.abs(A[0] - B[t]) + d[0][t - 1].value;
                        d[0][t].formula = 'd[0,'+t+'] = dist(0,'+t+')+d[0,'+(t-1)+'] = ' + Math.abs(B[k] - A[0]) + '+' + d[0][t - 1].value + ' = ' + d[0][t].value;
                    }
                    else if (metric == 1) {
                        d[0][t].value = Math.pow(A[0] - B[t], 2) + d[0][t - 1].value;
                        d[0][t].formula = 'd[0,'+t+'] = dist(0,'+t+')+d[0,'+(t-1)+'] = ' + Math.pow(A[0] - B[t], 2) + '+' + d[0][t - 1].value + ' = ' + d[0][t].value;
                    }
                    else if (metric == 2) {
                        d[0][t].value = +((Math.abs(A[0] - B[t]) / (Math.abs(A[0]) + Math.abs(B[t])) + d[0][t - 1].value).toFixed(3));
                        d[0][t].formula = 'd[0,'+t+'] = dist(0,'+t+')+d[0,'+(t-1)+'] = ' + Math.abs(A[0] - B[t]) / (Math.abs(A[0]) + Math.abs(B[t])) + '+' + d[0][t - 1].value + ' = ' + d[0][t].value;
                    }
                    else if (metric == 3) {
                        d[0][t].value = Math.pow(Math.abs(A[0] - B[t]), 3) + d[0][t - 1].value;
                        d[0][t].formula = 'd[0,'+t+'] = dist(0,'+t+')+d[0,'+(t-1)+'] = ' + Math.pow(Math.abs(A[0] - B[t]), 3) + '+' + d[0][t - 1].value + ' = ' + d[0][t].value;
                    }
                }
                else if (t == 0) {
                    if (metric == 0) {
                        d[r][0].value = Math.abs(A[r] - B[0]) + d[r - 1][0].value;
                        d[r][0].formula = 'd['+ r +',0] = dist('+r+',0)+d['+ (r-1) + ',0] = ' + Math.abs(A[r] - B[0]) + '+' + d[r - 1][0].value + ' = ' + d[r][0].value;

                    }
                    else if (metric == 1) {
                        d[r][0].value = Math.pow(A[r] - B[0], 2) + d[r - 1][0].value;
                        d[r][0].formula = 'd['+ r +',0] = dist('+r+',0)+d['+ (r-1) + ',0] = ' + Math.pow(A[r] - B[0], 2) + '+' + d[r - 1][0].value + ' = ' + d[r][0].value;

                    }
                    else if (metric == 2) {
                        d[r][0].value = +((Math.abs(A[r] - B[0]) / (Math.abs(A[r]) + Math.abs(B[0])) + d[r - 1][0].value).toFixed(3));
                        d[r][0].formula = 'd['+ r +',0] = dist('+r+',0)+d['+ (r-1) + ',0] = ' + Math.abs(A[r] - B[0]) / (Math.abs(A[r]) + Math.abs(B[0])) + '+' + d[r - 1][0].value + ' = ' + d[r][0].value;

                    }
                    else if (metric == 3) {
                        d[r][0].value = Math.pow(Math.abs(A[r] - B[0]), 3) + d[r - 1][0].value;
                        d[r][0].formula = 'd['+ r +',0] = dist('+r+',0)+d['+ (r-1) + ',0] = ' + Math.pow(Math.abs(A[r] - B[0]), 3) + '+' + d[r - 1][0].value + ' = ' + d[r][0].value;

                    }
                }
            }
        }
    }
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
                    dist = +((Math.abs(A[l] - B[p]) / (Math.abs(A[l]) + Math.abs(B[p]))).toFixed(3));
                else if (metric == 3)
                    dist = Math.pow(Math.abs(A[l] - B[p]), 3);
                // min(diagonal, up, left)
                d[l][p].value = +((dist + Math.min(d[l - 1][p - 1].value, d[l - 1][p].value, d[l][p - 1].value)).toFixed(3));
                d[l][p].formula = 'd[' + l + ',' + p + '] = dist(' + l + ',' + p + ')+min{d[' + (l - 1) + ',' + (p - 1) + '], d[' + (l - 1) + ',' + p + '], d[' + l + ',' + (p - 1) + ']} = ';
                d[l][p].formula = d[l][p].formula + dist + '+' + Math.min(d[l - 1][p - 1].value, d[l - 1][p].value, d[l][p - 1].value) + ' = ' + d[l][p].value;
            }
        }
    }
    else if (window == 1) {
        for (var l = 1; l < m; l++) {
            for (var p = Math.max(l - parseInt(window_param), 1); p < Math.min(n, l + parseInt(window_param) + 1); p++) {
                if (metric == 0)
                    dist = Math.abs(A[l] - B[p]);
                else if (metric == 1)
                    dist = Math.pow(A[l] - B[p], 2);
                else if (metric == 2)
                    dist = +((Math.abs(A[l] - B[p]) / (Math.abs(A[l]) + Math.abs(B[p]))).toFixed(3));
                else if (metric == 3)
                    dist = Math.pow(Math.abs(A[l] - B[p]), 3);
                // min(diagonal, up, left)
                d[l][p].value =+((dist + Math.min(d[l - 1][p - 1].value, d[l - 1][p].value, d[l][p - 1].value)).toFixed(3));
                d[l][p].formula = 'd[' + l + ',' + p + '] = dist(' + l + ',' + p + ')+min{d[' + (l - 1) + ',' + (p - 1) + '], d[' + (l - 1) + ',' + p + '], d[' + l + ',' + (p - 1) + ']} = ';
                d[l][p].formula = d[l][p].formula + dist + '+' + Math.min(d[l - 1][p - 1].value, d[l - 1][p].value, d[l][p - 1].value) + ' = ' + d[l][p].value;
            }
        }
    }
    else if (window == 2) {
        for (var l = 1; l < m; l++) {
            for (var p = 1; p < n; p++) {
                if (itakura(l + 1, p + 1, m, n)) {
                    if (metric == 0)
                        dist = Math.abs(A[l] - B[p]);
                    else if (metric == 1)
                        dist = Math.pow(A[l] - B[p], 2);
                    else if (metric == 2)
                        dist = +((Math.abs(A[l] - B[p]) / (Math.abs(A[l]) + Math.abs(B[p]))).toFixed(3));
                    else if (metric == 3)
                        dist = Math.pow(Math.abs(A[l] - B[p]), 3);
                    d[l][p].value = +((dist + Math.min(d[l - 1][p - 1].value, d[l - 1][p].value, d[l][p - 1].value)).toFixed(3));
                    d[l][p].formula = 'd[' + l + ',' + p + '] = dist(' + l + ',' + p + ')+min{d[' + (l - 1) + ',' + (p - 1) + '], d[' + (l - 1) + ',' + p + '], d[' + l + ',' + (p - 1) + ']} = ';
                    d[l][p].formula = d[l][p].formula + dist + '+' + Math.min(d[l - 1][p - 1].value, d[l - 1][p].value, d[l][p - 1].value) + ' = ' + d[l][p].value;
                }
            }
        }
    }
    else if (window == 3) {
        var slant = n / m;
        for (var l = 1; l < m; l++) {
            var slant_l = Math.ceil(l * slant);
            for (var p = Math.max(slant_l - parseInt(window_param), 1); p < Math.min(n, slant_l + parseInt(window_param) + 1); p++) {
                if (metric == 0)
                    dist = Math.abs(A[l] - B[p]);
                else if (metric == 1)
                    dist = Math.pow(A[l] - B[p], 2);
                else if (metric == 2)
                    dist = +((Math.abs(A[l] - B[p]) / (Math.abs(A[l]) + Math.abs(B[p]))).toFixed(3));
                else if (metric == 3)
                    dist = Math.pow(Math.abs(A[l] - B[p]), 3);
                d[l][p].value = +((dist + Math.min(d[l - 1][p - 1].value, d[l - 1][p].value, d[l][p - 1].value)).toFixed(3));
                d[l][p].formula = 'd[' + l + ',' + p + '] = dist(' + l + ',' + p + ')+min{d[' + (l - 1) + ',' + (p - 1) + '], d[' + (l - 1) + ',' + p + '], d[' + l + ',' + (p - 1) + ']} = ';
                d[l][p].formula = d[l][p].formula + dist + '+' + Math.min(d[l - 1][p - 1].value, d[l - 1][p].value, d[l][p - 1].value) + ' = ' + d[l][p].value;

            }
        }
    }

    // distance is d[m-1][n-1] for Euclidean, Canberra need to take root
    var distance = d[m - 1][n - 1].value;
    if (metric == 1)
        distance = +(Math.pow(distance, 1 / 2).toFixed(2));
    else if (metric == 3)
        distance = +(Math.pow(distance, 1 / 3).toFixed(2));
    console.log(distance);
    return {"data": d, "distance": distance};
};

// returns warping path given cost matrix
warpingPath = function (d) {
    var i = d.length - 1; //row
    var j = d[0].length - 1;//column
    var box_w = (d.length < 26 && d[0].length < 26) ? 25 : 10;
    var path = Array();

    //path.push([i,j]);
    //path.push([d[i][j].x + box_w, d[i][j].y + box_w]); // so that the line starts from the bottom corner
    path.push([d[i][j].x + box_w / 2, d[i][j].y + box_w / 2]);
    while (!(i == 0 && j == 0)) {
        if (i == 0)
            j = j - 1;
        else if (j == 0)
            i = i - 1;
        else {
            if (d[i - 1][j-1].value == Math.min(d[i - 1][j - 1].value, d[i - 1][j].value, d[i][j - 1].value)){
                i = i - 1;
                j = j - 1;
            }
            else if (d[i][j - 1].value == Math.min(d[i - 1][j - 1].value, d[i - 1][j].value, d[i][j - 1].value))
                j = j - 1;
            else {
                i = i - 1;
            }
        }

        //path.push([j, i]);
        path.push([d[i][j].x + box_w / 2, d[i][j].y + box_w / 2]);
    }
    //path.push([0,0]);
    //path.push([d[0][0].x, d[0][0].y]);
    return path;
}
;
itakura = function (i, j, n, m) {
    return (j < 2 * i) && (i <= 2 * j) && (i >= n - 1 - 2 * (m - j)) && (j > m - 1 - 2 * (n - i));
};