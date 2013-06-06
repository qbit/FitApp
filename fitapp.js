var fitApp = angular.module('fitApp', []),
ding = document.createElement('audio');
ding.setAttribute('src', 'ding.mp3');
ding.load();

//TODO clean up the loading and saving of data.

function pretty(t){
        var ret = [];
        
        t = t/1000;
        
        var hours = Math.floor(((t % 31536000) % 86400) / 3600);
        var minutes = Math.floor((((t % 31536000) % 86400) % 3600) / 60);
        var seconds = (((t % 31536000) % 86400) % 3600) % 60;
        
        ret.push((hours < 10) ? '0'+hours : hours);
        ret.push((minutes < 10) ? '0'+minutes : minutes);
        ret.push((seconds < 10) ? '0'+seconds : seconds);
        
        return ret;
}

function fitCtl($scope, $timeout) {
        var mainTimeout;
        
        $scope.mainCounter = 0;
        $scope.timer = '00:00:00';
        $scope.running = false;
        $scope.actrand = true;
        $scope.actidx = 0;
                
        $scope.mainOnTimeout = function(){
                var activity;
                $scope.mainCounter++;
                $scope.timer = pretty($scope.actfreq - $scope.mainCounter * 1000).join(':');
                
                if (($scope.mainCounter * 1000) === $scope.actfreq) {
                        
                        $timeout.cancel(mainTimeout);
                        
                        if ($scope.actrand) {
                                activity = $scope.randomAct();
                        } else {
                                if ($scope.activities.length === $scope.actidx) {
                                        notify('Congrats!', 'You have completed all your activities!');
                                        $scope.toggleMain();
                                        $scope.actidx = 0;
                                }
                                activity = $scope.activities[$scope.actidx];
                                $scope.actidx++;
                        }

                        notify(activity.name, activity.desc, function(){
                                $scope.mainCounter = 0;
                                mainTimeout = $timeout($scope.mainOnTimeout,1000);
                        });                       
                } else {
                       mainTimeout = $timeout($scope.mainOnTimeout,1000); 
                }
        }
        
        $scope.toggleMain = function(){
                var togg = $('#maintgl');
                
                if ($scope.running) {
                        $timeout.cancel(mainTimeout);
                        togg.html('Start');
                } else {
                       mainTimeout = $timeout($scope.mainOnTimeout,1000);
                       togg.html('Stop');
                }
                
                $scope.running = !$scope.running;
                
        }
        
        $scope.clearMain = function() {
                $('#maintgl').html('Start');
                $scope.mainCounter = 0;
                $scope.timer = '00:00:00';
                $timeout.cancel(mainTimeout);
        }
        
        $scope.addActivity = function() {
                if (!$scope.actname && !$scope.actdesc) {
                        return;
                } else {
                        $scope.activities.push({name: $scope.actname, desc: $scope.actdesc});
                        saveData('activities', $scope.activities);
                
                        $scope.actname = '';
                        $scope.actdesc = '';    
                }

        }
        
        $scope.removeAct = function(idx) {
                $scope.activities.splice(idx, 1);
                saveData('activities', $scope.activities);
        }
        
        $scope.setRand = function() {
                saveData('actrand', $scope.actrand);
        }
        
        $scope.actSave = function() {
                $scope.activities[$scope.edactid].name = $scope.edactname;
                $scope.activities[$scope.edactid].desc = $scope.edactdesc;
                $('#actedit').attr('disabled', 'disabled');
                $scope.edactname = '';
                $scope.edactdesc = '';
                $scope.edactid = '';
                
                saveData('activities', $scope.activities);
        }
        
        $scope.loadEditAct = function(idx) {
                var e = $('#actedit'), state = e.attr('disabled');
                $scope.edactname = $scope.activities[idx].name;
                $scope.edactdesc = $scope.activities[idx].desc;
                $scope.edactid = idx;
                
                (state === 'disabled') ? e.removeAttr('disabled') : e.attr('disabled', 'disabled');
        }
        
        var defAct = [
                { 
                        name: "Pushups",
                        desc: "Do 15 pushups!"
                },
                {
                        name: "Jumping Jacks",
                        desc: "Do as many jumping jacks as you can in 60 seconds."
                },
                {
                        name: 'Wrist Stretches',
                        desc: "Put your palms together and firmly press down until you feel stretching in your wrists."
                },
                {
                        name: 'Mountain Climbers',
                        desc: "Do 30 mountain climbers or as many as you can in 45 seconds."
                },
                {
                        name: 'Leg Stretches',
                        desc: 'While sitting in your chair, extend a leg out in front of you. Flex your toes back as far as you can until you feel a stretch. Hold for 20 seconds and repeat with other leg.'
                },
                {
                        name: 'Ham Stretches',
                        desc: 'Hold your back as straight as possible, then bend over and try to touch your toes. Hold this for 30 seconds.'
                },
                {
                        name: 'Calf Flexors',
                        desc: 'While holding onto a wall or door frame, place your feet flat on the ground and roll up onto the balls of your feet. Stay in the air for 2 or 3 seconds, then let yourself down.  Do as many of these as you can in 60 seconds.'
                },
                {
                        name: 'Human Plank',
                        desc: 'Lay on your side and lift yourself with your elbow. Fully extend your arm and keep your body as stiff as possible. Hold this for 30 seconds then switch sides and do it again!'
                }
        ];
        
        $scope.loadActs = function(d) {
                if (d && d.activities) {
                        $scope.activities = d.activities;
                } else {
                        $scope.activities = defAct;
                }
        }
        
        $scope.resetActs = function() {
                var doit = confirm('Are you sure? This will delete any custom activities you have created!');
                
                if (doit) {
                        $scope.activities = defAct;
                        saveData('activities', $scope.activities);
                }
        }
        
        loadData($scope, 'activities', 'loadActs');
        
        $scope.randomAct = function() {
                var len = $scope.activities.length;
                return $scope.activities[Math.floor( Math.random() * len )];
        }
        
        $scope.setFreq = function() {
                $scope.actfreq = toMilli(this.visfreq);
                $scope.saveFreq();
        }
        
        $scope.loadRand = function(d) {
                $scope.actrand = d.actrand;
        }
        
        $scope.loadFreq = function(d) {
                
                if (d && d.actfreq) {
                        $scope.actfreq = d.actfreq;
                } else {
                        $scope.actfreq = 1800000;
                }
                
                $scope.visfreq = toMinutes($scope.actfreq);
        }
        
        $scope.saveFreq = function() {
                saveData('actfreq', $scope.actfreq);
        }
        
        loadData($scope, 'actfreq', 'loadFreq');
        loadData($scope, 'actrand', 'loadRand');
}

function notify(title, msg, fn) {
        var m;
        fn = fn || function() {};
        ding.play();
        if (webkitNotifications && webkitNotifications.createNotification) {
                
                if (window.webkitNotifications.checkPermission() !== 0) {
                        window.webkitNotifications.requestPermission();
                }
                
                m = webkitNotifications.createNotification('', title, msg);
                m.onclose = function() {
                        m.onclick = null;
                        fn.call();
                        m.close();
                }
                m.onclick = function() {
                        m.onclose = null;
                        fn.call();
                        m.close();
                }
                
                m.show();
        } else {
                alert(title + "\n" + msg);
        }
}

function saveData(item, value) {
        if (chrome && chrome.storage) {
                var o = {};
                o[item] = value;
                chrome.storage.sync.set(o);
        } else {
                
                localStorage[item] = JSON.stringify(value);
        }
}

function loadData($scope, item, fn_name) {
        if (chrome && chrome.storage) {
                loadFromSync($scope, item, fn_name);
        } else {
                loadFromLocal($scope, item, fn_name);
        }
}

function loadFromSync($scope, item, fn_name) {
        chrome.storage.sync.get(item, function(d) {
                $scope.$apply(function() {
                        $scope[fn_name](d);
                });
        });
}

function loadFromLocal($scope, item, fn_name) {
        var d = {};
        
        if (localStorage[item]) {
                d[item] = JSON.parse(localStorage[item]);
        }
        
        $scope[fn_name](d);
}

function toMilli(d){
        return d*60*1000;
}

function toMinutes(d){
        return d/60/1000;
}
