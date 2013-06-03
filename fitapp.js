

function actCtl($scope) {
        var defAct = [
                { 
                        name: "Pushups",
                        number: 15,
                        desc: "Do $n pushups!"
                },
                {
                        name: "Jumping Jacks",
                        time: 60,
                        desc: "Do as many jumping jacks as you can in $t seconds."
                }
        ];
        
        if (localStorage.useCustom) {
                defAct = localStorage.activities;
        }
        
        $scope.activities = defAct;
}

function toMilli(d){
        return d*60*1000;
}

function toMinutes(d){
        return d/60/1000;
}

function timerCtl($scope) {
        
}

function setCtl($scope) {
        $scope.setFreq = function() {
                $scope.actfreq = toMilli(this.visfreq);
                $scope.saveFreq();
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
                chrome.storage.sync.set({actfreq: $scope.actfreq});
        }
        
        chrome.storage.sync.get('actfreq', function(d) {
                $scope.$apply(function() {
                        $scope.loadFreq(d);
                });
        });
        
}

function countCtl() {

}