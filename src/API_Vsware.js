

var ApiVs = {

    logCall: false,
    parallel: function(promises) {
        return RSVP.hash(promises);
    },

    get: function(url) {
        var promise = new RSVP.Promise(function(resolve, reject) {
            $.ajax({
                type: "GET",
                url: url,
                contentType: "application/json",
                success: function(result) {
                    ApiVs.logInput("GET", url, result, "success")
                    resolve(result);
                },
                error: function(error) {
                    ApiVs.logInput("GET", url, error, "failure")
                    reject(error);
                }
            });
        });

        return promise;
    },

    post: function(url, payload) {
        ApiVs.logInput("POST", url);
        var promise = new RSVP.Promise(function(resolve, reject) {
            $.postJSON(url, payload,
                function(data) {
                    ApiVs.logInput("POST", url, data, "success");
                    resolve(data);
                },
                function(error) {
                    ApiVs.logInput("POST", url, error, "error");
                    reject(error, payload);
                });
        });
        if (ApiVs.logCall === true) {
            promise.then(function(response) {
                console.log(response);
                return this;
            });
        }
        return promise;
    },

    put: function(url, payload) {
        ApiVs.logInput("PUT", url);
        var data = JSON.stringify(payload);
        var promise = new RSVP.Promise(function(resolve, reject) {
            $.ajax({
                type: "PUT",
                url: url,
                contentType: "application/json",
                data: data,
                success: function(result) {
                    console.log("PUT success");
                    ApiVs.logInput("PUT", url, result, "success");
                    resolve(result);
                },
                error: function(error) {
                    console.error(error);
                    ApiVs.logInput("PUT", url, error, "failure");
                    reject(error);
                }
            });
        });
        if (ApiVs.logCall === true) {
            promise.then(function(response) {
                console.log(response);
                return this;
            });
        }
        return promise;
    },

    patch: function(url, payload) {
        ApiVs.logInput("PATCH", url);
        var data = JSON.stringify(payload);
        var promise = new RSVP.Promise(function(resolve, reject) {
            $.ajax({
                type: "PATCH",
                url: url,
                contentType: "application/json",
                data: data,
                success: function(result) {
                    console.log("PATCH success");
                    ApiVs.logInput("PATCH", url, result, "success");
                    resolve(result);
                },
                error: function(error) {
                    console.error(error);
                    ApiVs.logInput("PATCH", url, error, "failure");
                    reject(error);
                }
            });
        });
        if (ApiVs.logCall === true) {
            promise.then(function(response) {
                console.log(response);
                return this;
            });
        }
        return promise;
    },

    delete: function(url, payload) {
        console.log("DELETING URL: " + url);
        var data = JSON.stringify(payload);
        var promise = new RSVP.Promise(function(resolve, reject) {
            $.ajax({
                type: "DELETE",
                url: url,
                contentType: "application/json",
                data: data,
                success: function(result) {
                    console.log("DELETE success");
                    ApiVs.logInput("DELETE", url, result, "success");
                    resolve(result);
                },
                error: function(error) {
                    console.error(error);
                    ApiVs.logInput("DELETE", url, error, "failure");
                    reject(error);
                }
            });
        });
        return promise;
    },

    logInput: function(method, url, response, success) {
        var log = {
            method: method,
            url: url,
            success: success,
            response: "Response in next console log"
        };
        if (ApiVs.logCall === true) {
            console.log(JSON.stringify(log, null, "\t"));
            console.log(response);
        }
    },


    upload: function (url, formdata, progress) {
        ApiVs.logInput("UPLOAD", url);
        return new RSVP.Promise(function(resolve, reject) {
            $.ajax({
                xhr: function () {
                    var xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener("progress", function(evt) {
                        if (evt.lengthComputable) {
                            if (progress) {
                                progress(evt.loaded, evt.total);
                            }
                        }
                    }, false);
                    return xhr;
                },
                type: "POST",
                url: url,
                data: formdata,
                contentType: false,
                processData: false,
                success: function (result) {
                    if (result === '') {
                        reject(result);
                    } else {
                        resolve(result.payload);
                    }
                },
                error: function (result) {
                    reject(result);
                }
            });
        });
    },

    mock: function(object, isSuccessful, timeout, progress) {
        isSuccessful = isSuccessful === undefined ? true : isSuccessful;
        return new RSVP.Promise(function(resolve, reject) {
            if (ApiVs.logCall === true) {
                ApiVs.logInput("MOCK", "", object, "success");
            }
            if (timeout) {
                var interval = null;
                if (typeof progress === 'function') {
                    var step = timeout / 100;
                    var current = 0;
                    interval = setInterval(function () {
                        progress(current, timeout);
                        current += step;
                    }, step);
                }
                setTimeout(function() {
                    if (interval) {
                        clearInterval(interval);
                    }
                    isSuccessful ? resolve(object) : reject(object);
                }, timeout);
            } else {
                isSuccessful ? resolve(object) : reject(object);
            }
        });
    }
};
