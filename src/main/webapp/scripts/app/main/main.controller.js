'use strict';

angular.module('nummapApp')
    .controller('MainController', function ($scope, $state, Principal, $http, $filter) {
        Principal.identity().then(function(account) {
            $scope.account = account;
            $scope.isAuthenticated = Principal.isAuthenticated;
        });

        /* Etat de la zone de recherche */
        $scope.isCollapsed = true;
        $scope.isCollapsedCat = true;
        $scope.isCollapsedField = true;
        

        /* Pour la recherche */
        $scope.categories = [
            {value: 'ALL', translationKey: 'register.form.category.all', checked: 'false'},
            {value: 'STUDENT', translationKey: 'register.form.category.student', checked: 'false'},
            {value: 'PROFESSOR', translationKey: 'register.form.category.professor', checked: 'false'},
            {value: 'FREELANCE', translationKey: 'register.form.category.freelance', checked: 'false'},
            {value: 'COMPANY', translationKey: 'register.form.category.company', checked: 'false'},
            {value: 'ASSOCIATION', translationKey: 'register.form.category.association', checked: 'false'}
        ];

        $scope.fields = [
            {name: 'All', value: 'ALL', checked: 'false'},
            {name: 'Outsourcing', value: 'OUTSOURCING', checked: 'false'},
            {name: 'Consulting', value: 'CONSULTING', checked: 'false'},
            {name: 'System Integration', value: 'SYSTEM_INTEGRATION', checked: 'false'}
        ];

        $scope.choosenCategories = [];
        $scope.choosenFields = [];

        $scope.selectCategory = function(index) {
            if (index === 0) {
                $scope.choosenCategories = [];
                $scope.categories.forEach(function (element) {
                    element.checked = 'false';
                    // On sélectionne toutes les catégories
                    $scope.choosenCategories.push(element.value);
                });
                $scope.categories[0].checked = 'true';    
            } else {
                // On déselectionne 'ALL'
                $scope.categories[0].checked = 'false';
                if ($scope.choosenCategories.indexOf('ALL') !== -1){
                    $scope.choosenCategories = [];
                }

                // Si selectionné, on le déselectionne et on le retire des choosenCategories
                if ($scope.categories[index].checked === 'true') {
                    $scope.categories[index].checked = 'false';
                    $scope.choosenCategories.splice($scope.choosenCategories.indexOf($scope.categories[index].value),1);
                }
                // Sinon, on le selectionne et on le push dans les choosenCategories
                else {
                    console.log('ici');
                    $scope.categories[index].checked = 'true';
                    $scope.choosenCategories.push($scope.categories[index].value);
                }
            }
            console.log($scope.choosenCategories);
        };

        $scope.selectField = function(index) {
            if (index === 0) {
                $scope.fields.forEach(function (element) {
                    element.checked = false;
                    // On sélectionne toutes les catégories
                    $scope.choosenFields.push(element.value);
                });
                $scope.fields[0].checked = true;
            } else {
                $scope.fields[0].checked =false;
                $scope.fields[index].checked = !$scope.fields[index].checked;
            }
        };

        /* Position de la "camera" sur la carte */
        $scope.center = {
            lat: 43.28520334369384,
            lng: -0.289764404296875,
            zoom: 9
        };

        /* Déclaration des tableaux */
        $scope.markers = [];
        $scope.markersFiltered = [];

        /* Fonction permettant de set les icons */
        $scope.setIcons = function(){
            $scope.markers.forEach(function(element){
                element.group = 'numlab';
                if(element.category == "STUDENT"){
                  element.icon = local_icons.STUDENT;
                }
                else if(element.category == "FREELANCE"){
                  element.icon = local_icons.FREELANCE;
                }
                else if(element.category == "PROFESSOR"){
                  element.icon = local_icons.PROFESSOR;
                }
                else if(element.category == "COMPANY"){
                  element.icon = local_icons.COMPANY;
                }
                else if(element.category == "ASSOCIATION"){
                    element.icon = local_icons.ASSOCIATION;
                }

            });
        };

        /* Fonction permettant d'ajouter à tous les markers la propriété detail, qui permettra d'afficher des details sur le marker */
        $scope.setBoolDetail = function(){
            $scope.markers.forEach(function(element){
                element.detail = false;
            });
        };

        $scope.$on('leafletDirectiveMarker.click', function(e, args) {
            if (typeof  $scope.markersFiltered[args.markerName] !== 'undefined') {
                $scope.markersFiltered[args.markerName].detail = true;
                document.getElementById($scope.markersFiltered[args.markerName].name).scrollIntoView( true );
            }
        });

        $scope.$on('leafletDirectiveMarker.popupclose', function(e, args) {
            if (typeof  $scope.markersFiltered[args.markerName] !== 'undefined') {
                $scope.markersFiltered[args.markerName].detail = false;
            }
        });

        /* Centrage de la carte sur le marker sur lequel on a cliqué dans le menu */
        $scope.goToMarker = function(marker){
           $scope.center.lat = marker.lat;
           $scope.center.lng = marker.lng;
           $scope.center.zoom = 35;
           marker.focus = true;
        };


        /* Récupération de l'ensemble des markers au chargement de la page */
        $scope.loadAll = function() {
            $http.get('api/markers', {})
                .success(function(data){
                    $scope.markers = data;
                    /* Ajout des incones */
                    $scope.setIcons();
                    /* Ajout du boolean details permettant l'affichage en détails de l'element */
                    $scope.setBoolDetail();
                    $scope.markersFiltered = $scope.markers;
                });
        };
        $scope.loadAll();

        /* Icones pour l'affichage des markers */
        var local_icons = {
            default_icon: {},
            STUDENT: {
                iconUrl: 'scripts/app/images/university.png',
                iconMenuUrl : 'scripts/app/images/universityMenu.png',
                iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
                popupAnchor:  [15, 5]
            },
            PROFESSOR: {
                iconUrl: 'scripts/app/images/highschool.png',
                iconMenuUrl : 'scripts/app/images/highschoolMenu.png',
                iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
                popupAnchor:  [15, 5]
            },
            COMPANY:{
                iconUrl: 'scripts/app/images/office-building.png',
                iconMenuUrl : 'scripts/app/images/office-buildingMenu.png',
                iconAnchor:     [0, 0],
                popupAnchor:  [15, 5]
            },
            FREELANCE:{
                iconUrl: 'scripts/app/images/workoffice.png',
                iconMenuUrl : 'scripts/app/images/workofficeMenu.png',
                iconAnchor:     [0, 0],
                popupAnchor:  [15, 5]
            },
           ASSOCIATION:{
                iconUrl: 'scripts/app/images/museum_science.png',
               iconMenuUrl : 'scripts/app/images/museum_scienceMenu.png',
                iconAnchor:     [0, 0],
               popupAnchor:  [15, 5]
            }
        };

        var tilesDict = {
            openstreetmap: {
                url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                options: {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }
            }
        };

        angular.extend($scope, {
            center: $scope.center,
            tiles: tilesDict.openstreetmap,
            defaults: {
                scrollWheelZoom: true,
                zoomControlPosition: 'bottomleft'
            }
        });

        $scope.$watch('markerFilter', function(newText) {
            $scope.markersFiltered2 = $filter('markers')($scope.markers, $scope.choosenCategories); 
            $scope.markersFiltered = $filter('filter')($scope.markersFiltered2, newText);
            /* Pour créer un nouveau cluster avec un nom différent et ne pas avoir d'érreur de cluster null*/
            var rand_str = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
            $scope.markersFiltered.forEach(function(element) {
            element.group = rand_str;
            });
        },true);

        $scope.$watch('choosenCategories', function(newText) {
            $scope.markersFiltered2 = $filter('filter')($scope.markers, $scope.markerFilter);
            $scope.markersFiltered = $filter('markers')($scope.markersFiltered2, newText);
            // Pour créer un nouveau cluster avec un nom différent et ne pas avoir d'érreur de cluster null
            var rand_str = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
            $scope.markersFiltered.forEach(function(element) {
                element.group = rand_str;
            });
        },true);


    });
