// returns DTW distance matrix between A and B
// metrics
// 0 - Manhattan distance (simply abs value)
// 1 - Euclidean distance (need to take sqrt only from d[m-1][n-1])
// 2 - Canberra distance
// 3 - Minkowski distance with p = 3

dynamicTimeWarping = function(A, B, metric) {
    var m = A.length;
    var n = B.length;
    var d = [];
    for (var i=0; i < m; i++) {
        var row = [];
        for (var s = 0; s < n; s++) 
            row.push(0);
        d.push(row);
    }
    d[0][0] = Math.abs(A[0]-B[0]);
    for (var j = 1; j < m; j++){
        if (metric == 0)
            d[j][0] = Math.abs(A[j]-B[0]) + d[j-1][0];
        else if (metric == 1)
            d[j][0] = Math.pow(A[j]-B[0], 2) + d[j-1][0];
        else if (metric == 2)
            d[j][0] = Math.round(Math.abs(A[j]-B[0]) / (Math.abs(A[j]) + Math.abs(B[0])),2) + d[j-1][0];
        else
            d[j][0] = Math.pow(Math.abs(A[j]-B[0]), 3) + d[j-1][0];
    }
    for (var k = 1; k < n; k++){
        if (metric == 0)
            d[0][k] = Math.abs(B[k]-A[0]) + d[0][k-1];
        else if (metric == 1)
            d[0][k] = Math.pow(B[k]-A[0], 2) + d[0][k-1];
        else if (metric == 2)
            d[0][k] = Math.round(Math.abs(B[k]-A[0]) / (Math.abs(B[k]) + Math.abs(A[0])),2) + d[0][k-1];
        else (metric == 3)
            d[0][k] = Math.pow(Math.abs(B[k]-A[0]), 3) + d[0][k-1];
    }
    for (var l = 1; l < m; l++){
        for (var p = 1; p < n; p++){
            var dist = 0;
            if (metric == 0)
                dist = Math.abs(A[l]-B[p]);
            else if (metric == 1)
                dist = Math.pow(A[l]-B[p], 2);
            else if (metric == 2)
                dist = Math.round(Math.abs(B[l]-A[p]) / (Math.abs(B[l]),2) + Math.abs(A[p]))
            else 
                dist = Math.pow(Math.abs(A[l]-B[p]), 3);
            // min(diagonal, up, left)
            d[l][p] = dist + Math.min(d[l-1][p-1], d[l-1][p], d[l][p-1]);
        }
    }
    // distance is d[m-1][n-1] for Euclidean, Canberra need to take root
    var distance =  d[m-1][n-1];
     if (metric == 1)
        distance = Math.round(Math.pow(distance, 1/2),2);
    else if (metric == 3)
        distance = Math.round(Math.pow(distance, 1/3),2);
    return [d,distance];
};

// returns warping path given cost matrix
warpingPath = function(d) {
    var i = d.length - 1;
    var j = d[0].length -1;
    var path = [[i,j]];
    while (i<0 && j <0){
        if (i == 0)
            j = j - 1;
        else if (j == 0)
            i = i - 1;
        else {
            if (d[i-1][j] == Math.min(d[i-1][j-1], d[i-1][j], d[i][j-1]))
                i = i - 1;
            else if (d[i][j-1] == Math.min(d[i-1][j-1], d[i-1][j], d[i][j-1]))
                j = j - 1;
            else{
                i = i - 1;
                j = j - 1;
            }
        }
        path.push([j, i]);
    } 
    path.push([0,0]);
    return path;
};
