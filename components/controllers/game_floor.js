var app = angular.module("gamefloor", [])
.controller("myCtrl", ['$scope', '$timeout', '$window', function($scope, $timeout, $window) {

  var random = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  function createplayfield(min, max) {          //createplayfield crea il terreno di gioco e posiziona il player sulla prima piattaforma
    var l = random(min, max);
    var p = [];

    for (var i = 0; i < l; i++) {
      if (i < l - 1) {
        var stat = {
          min: random(1, 5),
          ridcheckmin: false,
          ridcheckmax: false,
          blackholevent: false,
          stabilization_count: 0,
        };
        if(i===0) {
          stat.player=true;
        }
        else{
          stat.player=false;
        }
        stat.max = random(stat.min, 5);
        if (stat.min != stat.max) {
          p.push(stat);       //console.log(stat);
        } else {
          i--;
        }
      } else {
        var stat = {
          player: false,
          blackholevent: false,
        };
        p.push(stat);       //console.log(stat);
      }
    }
    return p;
  };

  function scrollplat(obj, platid) {       //scorrimento ricorsivo piattaforme alla ricerca di un percorso vincente
    var nextplatid;
    if (platid <= obj.length - 1) {
      var i = obj[platid].min;
      nextplatid = platid + i;      //selezione piattaforma successiva in base al percorso selezionato dal ciclo
      if (platid === obj.length - 1) {        //percorso valido trovato
        return true;
      } else {
        if (platid < obj.length) {
          return scrollplat(obj, nextplatid);         //passa alla successiva tappa del percorso
        }
      }
      return false;
    } else
      return false;
  };

  function supremescroller(obj, platid, check) {
    var nextplatid;
    if (platid < obj.length) {        // ciclo per esplorare tutte le opzioni della piattaforma

      i = obj[platid].min;
      nextplatid = platid + i;
      if(!obj[platid].ridcheckmin){
        check = scrollplat(obj, nextplatid) || check;
        obj[platid].ridcheckmin = true;
        i = obj[platid].max;
      }
      if(!obj[platid].ridcheckmax){
        nextplatid = platid + i;
        check = scrollplat(obj, nextplatid) || check;
        obj[platid].ridcheckmax = true;
      }

      if (check) {
        return true ;
      } else {        // ricorsioni per esplorare tutte le opzioni generate dalle opzioni della piattaforma
        i = obj[platid].min;
        nextplatid = platid + i;
        check = supremescroller(obj, nextplatid, check) || check;
        i = obj[platid].max;
        nextplatid = platid + i;
        check = supremescroller(obj, nextplatid, check) || check;
        if (check) {
          return true;
        }
      }
    }
    return check;
  };

  function searchplayfield(playfield) {
    if (supremescroller(playfield, 0, false))
      return playfield;
    else
      return searchplayfield(createplayfield(16, 26));
  };

  $scope.stop = function(){       //sit down and wait for the stabilization
    $scope.stopevent = true;
    var player = document.getElementById('player');
    player.classList.remove('action');
    player.classList.remove('teleshake');
    player.classList.add('shake');
    window.setTimeout(function(){
      player.classList.remove('shake');
    }, 6000);
  };

  function black_Hole_Stabilization(dedicated_bhp) {      //countdown per stabilizzazione dimensionale
    $scope.playfield[dedicated_bhp].stabilization_count ++;
    $timeout( function(){
      if($scope.playfield[dedicated_bhp].stabilization_count < 2) {
        $scope.playfield[dedicated_bhp].blackholevent = false;
        $scope.playfield[dedicated_bhp].stabilization_count = 0;
      }
      else{
        $scope.playfield[dedicated_bhp].stabilization_count = $scope.playfield[dedicated_bhp].stabilization_count-1;
      }
    }, 6000);
  };

  $scope.inverted_Dimension_Travel = function(){
    var allClass = document.getElementById('all').getAttribute("class");
    // console.log(allClass);
    // console.log($scope.gameMode);
    var all = document.getElementById('all');

    if(allClass === "bodyBGC"){
      all.classList.add('inverted');
      $scope.gameMode = 1;
    }
    else {
      all.classList.remove('inverted');
      $scope.gameMode = 0;
    }
  };

  $scope.holyjump = function(){        //Use holy power to complete the jump
    document.getElementById('hj').setAttribute("disabled","disabled");
    $timeout( function(){
      $scope.playfield[$scope.bhp].blackholevent = false;
      $scope.sharedbhe = false;
      $scope.holyjumpcounter = $scope.holyjumpcounter - 1;
    }, 50);
  };

  $scope.jumpit = function(selection) {       //crea e gestisci salti dimensionali
    selection = parseInt(selection);
    if($scope.gameMode === 0){          // se restituisce true il salto avverrà per addizione, altrimenti sarà per sottrazione
      $scope.bhp = $scope.ind + selection;
      var l = $scope.playfield.length - 1;
      if($scope.bhp <= l){
        $scope.playfield[$scope.bhp].blackholevent = $scope.sharedbhe;
      };
      if($scope.sharedbhe === true){
        black_Hole_Stabilization($scope.bhp);
        $scope.sharedbhe = false;
      };
      $timeout(function() {       //esegui il salto
          if($scope.stopevent == false) {
          //$scope.jumpselected($scope.ind);
          $scope.playfield[$scope.ind].player = false;
          $scope.ind = $scope.ind + selection;
          $scope.indtesto = "Your position: " + $scope.ind;
          var l = $scope.playfield.length - 1;
          if($scope.ind <= l){
            $scope.playfield[$scope.ind].player = true;
          }
        }
      }, 2000);
      $timeout(function() {       //verifica la vittoria o il fallimento
        if($scope.stopevent == false) {
          if ($scope.ind === l) {
            $window.location.href = 'winner.html';
          } else if ($scope.ind > l) {
            $window.location.href = 'loser.html';
          }
          if ($scope.playfield[$scope.ind].blackholevent === true) {
            $window.location.href = 'loser.html';
          }
        }
      }, 3000);
    }
    else {
      $scope.bhp = $scope.ind - selection;
      var l = $scope.playfield.length - 1;
      if($scope.bhp >= 0){
        $scope.playfield[$scope.bhp].blackholevent = $scope.sharedbhe;
      };
      if($scope.sharedbhe === true && $scope.bhp >= 0){
        black_Hole_Stabilization($scope.bhp);
        $scope.sharedbhe = false;
      };
      $timeout(function() {       //esegui il salto
          if($scope.stopevent == false) {
          //$scope.jumpselected($scope.ind);
          $scope.playfield[$scope.ind].player = false;
          $scope.ind = $scope.ind - selection;
          $scope.indtesto = "Your position: " + $scope.ind;
          var l = $scope.playfield.length - 1;
          if($scope.ind <= l){
            $scope.playfield[$scope.ind].player = true;
          }
        }
      }, 2000);
      $timeout(function() {       //verifica la vittoria o il fallimento
        if($scope.stopevent == false) {
          if ($scope.ind < 0) {
            $window.location.href = 'loser.html';
          }
          if ($scope.playfield[$scope.ind].blackholevent === true) {
            $window.location.href = 'loser.html';
          }
        }
      }, 3000);
    }
  };

  $scope.jumpselected = function(ind) {
      if (ind===0){
            $scope.datmuch = 0;
            $scope.playfieldcontainer=[$scope.playfield[ind].min,$scope.playfield[ind].max];
      }
      else {
        ind = ind-1;
        $scope.datmuch = 0;
        $scope.playfieldcontainer = [$scope.playfield[ind].min,$scope.playfield[ind].max];
      }
  }

    document.getElementById('jform').addEventListener("submit", function(evt){        //cooldown for submit, let the animation run
//      console.log(document.getElementById('player').getAttribute("class"));
      if(document.getElementById('player').getAttribute("class") === 'player ng-scope shake'){
        player.classList.add('teleshake');
        window.setTimeout(function(){
          player.classList.remove('teleshake');
        }, 2200);
      }
      else{
        player.classList.add('action');
        window.setTimeout(function(){
          player.classList.remove('action');
        }, 2200);
      }
    }, false);

  document.getElementById('jform').addEventListener("submit", function(evt){        //gestisci eventi legati al salto
    $scope.stopevent = false;       //sblocca il salto
    document.getElementById('stopb').removeAttribute("disabled");        //sblocca il bottone stop
    $scope.sharedbhe = Math.random() < 0.4;       //calcolo buconero
    console.log($scope.sharedbhe);
    document.getElementById('sj').setAttribute("disabled","disabled");        //blocca il tasto submit jump
    if($scope.sharedbhe === true && $scope.holyjumpcounter > 0){
      document.getElementById('hj').removeAttribute("disabled");        //abilita holyjump
    };
    setTimeout(function(){
      document.getElementById('stopb').setAttribute("disabled","disabled");
    }, 500);
    setTimeout(function(){
      document.getElementById('sj').removeAttribute("disabled");
      document.getElementById('hj').setAttribute("disabled","disabled");
    }, 2200);
  }, false);

  document.addEventListener('keydown', (event) => {
      const keyName = event.key;
      if(keyName === 's'){
        document.getElementById('stopb').click();
      }
      if(keyName === 'h'){
        document.getElementById('hj').click();
      }
  });

  $scope.gameMode = 0; // game mode default, scorrimento addizionale. quando settato a 1 lo scorrimento avviene per sottrazione
  $scope.holyjumpcounter = 3;
  $scope.playfield = searchplayfield(createplayfield(16, 26));
  $scope.ind = 0;
  //$scope.jumpselected($scope.ind);
  $scope.playfieldcontainer = [$scope.playfield[$scope.ind].min,$scope.playfield[$scope.ind].max];
  $scope.datmuch = 0;
}]);
