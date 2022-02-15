    var mapObject; //map 객체를 전역변수로 선언
    var mapOptions;
    var drawingManager;
    var language = ['Kr', 'En', 'Ja'];
    var flagImages = ['./korea.png', './usa.png', './japan.png'];
    var nowLanguage = 0;
    var menu = ['food_list','place_list'];
    var content = ['food_content', 'place_content'];
    var nowMenu = 0;
    var chargerMarkerVisible = false;

    var cache = [['', '', ''], ['', '', '']];
    var charger_info = '';
    //지도에 표시할 marker
    var placeMarker = null;
    var chargerMarkers = [];

    var lastSelect = 0;

    
    //최초 로딩시 실행되는 함수
    window.onload = function() { 
        document.cookie = 'SameSite=None; Secure';
        init_map();
        for( var i = 0; i < 2; i ++) {
            for(var j = 0; j < 3; j++) {
                getData(i, j);
            }
        }
        document.getElementsByClassName("food_list")[nowLanguage].style.display = "block";
        document.getElementById(content[nowMenu]).style.display = "block";
        getChargerData();
    }

    // map api를 초기화 하는 함수
    function init_map() {

        //map 객체의 옵션 지정
        mapOptions = {
            useStyleMap: true,
            draggable: false,
            pinchZoom: false,
            scrollWheel: false,
            keyboardShortcuts: false,
            disableDoubleTapZoom: true,
            disableDoubleClickZoom: true,
            disableTwoFingerTapZoom: true,
            center: new naver.maps.LatLng(35.1379222, 129.05562775),
            zoom: 13
        };

        //지정한 옵션과 함깨 map 객체 생성
        mapObject = new naver.maps.Map('map', mapOptions);
        naver.maps.Event.once(mapObject, 'init_stylemap', function () {
            console.log('init map', mapObject.getOptions('zoom') === 13);
        });

        naver.maps.onJSContentLoaded = function() {
            drawingManager = new naver.maps.drawing.DrawingManager({map: mapObject});
        };
    }

    //API로 부터 받은 json 형식의 자료를 파싱해주는 함수
    function parseJSON(json_var, menu, lang) {
        try {
            var list = JSON.parse(json_var);   
        } catch (e){
            xmlParser = new DOMParser();
            const xmlObject = xmlParser.parseFromString(json_var, "text/xml");
            var msg = '';
            for( i in xmlObject.firstChild.childNodes){
                if(xmlObject.firstChild.childNodes[i].textContent == undefined) { continue;}
                msg += xmlObject.firstChild.childNodes[i].textContent;
            }
            msg = msg.replaceAll('\t', '');
            alert("데이터를 읽어오는 중 문제가 생겼습니다.\n" + msg);
            return;
        }
        var items;
        switch(menu * 3 + lang) {
            case 0:
                items = list.getFoodKr.item;
                break;
            case 1:
                items = list.getFoodEn.item;
                break;
            case 2:
                items = list.getFoodJa.item;
                break;
            case 3:
                items = list.getAttractionKr.item;
                break;
            case 4:
                items = list.getAttractionEn.item;
                break;
            case 5:
                items = list.getAttractionJa.item;
                break;
        }
        cache[menu][lang] = items;
    }

    //nodejs를 통해서 api에서 데이터를 입력받아오는 함수
    function getData(menu, lang){
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                parseJSON(this.responseText, menu, lang);
                makeList(menu, lang);
                if(menu == 0 && lang == 0) {
                    viewListDetails(0);
                }
            }
        });
        switch(menu) {
            case 0:
                var url = 'http://localhost:5500/getFood?lang='+ language[lang];
                break;
            case 1:
                var url = 'http://localhost:5500/getPlace?lang='+ language[lang];
                break;
        }
        
        xhr.open("GET", url);
        xhr.send();
    }

    //nodejs를 통해서 api에서 데이터를 입력받아오는 함수
    function getChargerData(){
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                try {
                    var list = JSON.parse(this.responseText);   
                } catch (e){
                    alert("데이터를 읽어오는 중 문제가 생겼습니다.\n" + json_str);
                    return;
                }
                charger_info = list.getTblDischrgStusInfo.item;
                makeChargerMark();
            }
        });
        xhr.open("GET", 'http://localhost:5500/getCharger');
        xhr.send();
    }

    //외국 가게명에 포한된 한국어를 표준문자열을 이용해서 제거하는 함수
    function omitKor(text) {
        if( text.match(/[\uAC00-\uD7AF]/)) {
            return text.substring(0, text.lastIndexOf('('));
        }
        return text;
    }
    
    // 간단한 element object를 생성해 return하는 함수
    function makeSimpleNode(tagname,text = "") {
        const result = document.createElement(tagname);
        const text_node = document.createTextNode(text);
        result.appendChild(text_node);
        return result;
    }

    // 부산 맛집에 대한 list item을 만드는 함수
    function makeFoodItem(item, index, lang){

        const listItem = document.createElement("li");
        listItem.setAttribute("id", item.UC_SEQ);

        const button = document.createElement("button");
        button.setAttribute("onclick","viewListDetails("+index+")" );
        listItem.appendChild(button);

        const image = document.createElement("img")
        image.setAttribute("src", item.MAIN_IMG_THUMB);
        button.appendChild(image);

        let tTitle = item.TITLE;
        if(tTitle == ''){
            tTitle = item.SUBTITLE;
        }
        if(lang != 0){
            tTitle = omitKor(tTitle);
        }

        const title = makeSimpleNode("div",tTitle);
        title.setAttribute("class", "button_title_div")

        button.appendChild(title);

        const addr = makeSimpleNode("div",item.ADDR1);
        addr.setAttribute("class", "button_addr_div")
        button.appendChild(addr);
        
        return listItem;
    }
    // 관광 명소에 대한 list item을 만드는 함수
    function makePlaceItem(item, index){
        const listItem = document.createElement("li");
        listItem.setAttribute("id", item.UC_SEQ);

        const button = document.createElement("button");
        button.setAttribute("onclick","viewListDetails("+index+")" );
        listItem.appendChild(button);

        const image = document.createElement("img")
        image.setAttribute("src", item.MAIN_IMG_THUMB);
        button.appendChild(image);

        const title = makeSimpleNode("div",item.PLACE);
        title.setAttribute("class", "button_title_div")

        button.appendChild(title);

        const addr = makeSimpleNode("div",item.ADDR1);
        addr.setAttribute("class", "button_addr_div")
        button.appendChild(addr);

        return listItem;
    }
    
    //좌측 list를 생성하는 함수
    function makeList(menu, lang){
        var items = cache[menu][lang]; 

        for( var i = 0; i < items.length; i++){
            var item = items[i];
            if(menu == 0) {
                const li = makeFoodItem(item, i, lang);
                document.getElementsByClassName('food_list')[lang].appendChild(li);
            }
            if(menu == 1) {
                const li = makePlaceItem(item,i);
                document.getElementsByClassName('place_list')[lang].appendChild(li);
            }
        }
    }

    //검색 keyword를 form으로부터 가져와 주소 또는 가게 이름이 일치하는 것만 list에 표시하는 함수
    function searchListItem() {
        var items = cache[nowMenu][nowLanguage];
        var keyword = search.keyword.value;
        if(keyword == '') {
            document.getElementsByClassName(menu[nowMenu])[3].style.display = "none";
            document.getElementsByClassName(menu[nowMenu])[nowLanguage].style.display = "block";
            return;
        }
        document.getElementsByClassName(menu[nowMenu])[3].innerHTML = "";
        for( var i = 0; i < items.length; i++){
            var item = items[i];
            var title =item.TITLE;
            var address = item.ADDR1;
            
            if(nowLanguage == 1) {
                title = title.toLowerCase();
                address = address.toLowerCase();
                keyword = keyword.toLowerCase();
            }
            if(title.indexOf(keyword) != -1 || address.indexOf(keyword) != -1) {
                if(nowMenu == 0){
                    const li = makeFoodItem(item, i, nowLanguage);
                    document.getElementsByClassName("food_list")[3].appendChild(li);
                }
                if(nowMenu == 1) {
                    const li = makePlaceItem(item, i);
                    document.getElementsByClassName("place_list")[3].appendChild(li);
                }
            }
        }
        if(document.getElementsByClassName(menu[nowMenu])[3].innerHTML == '') {
            document.getElementsByClassName(menu[nowMenu])[3].innerHTML = '<h3> No Result</h3>';
        }
        
        document.getElementsByClassName(menu[nowMenu])[nowLanguage].style.display = "none";
        document.getElementsByClassName(menu[nowMenu])[3].style.display = "block";
    }

    // 좌측의 list item을 클릭했을 때 실행, 우측에 클릭된 item의 세부정보를 표시한다.
    function viewListDetails(list_num) {
        var item = cache[nowMenu][nowLanguage][list_num];
        lastSelect = list_num;
        if(nowMenu == 0) {                
            makeFoodDetail(item);
        }        
        if(nowMenu == 1) {
            makePlaceDetail(item);
        }
        try{
            setPlaceMarker(item);
        }catch(e){
            e.preventDefault();
        }
    }
    //오른쪽의 세부사항을 선택한 item의 내용으로 변경하는 함수 (관광명소에 대한 설명).
    function makePlaceDetail(item) {
        document.getElementById(content[nowMenu]).firstElementChild.innerText = item.PLACE;
        document.getElementById("view").src = item.MAIN_IMG_THUMB;
        document.getElementById("view").style.display = "initial";
        document.getElementById("photo").style.display = "none";
        document.getElementById("p_detail").innerHTML = item.ITEMCNTNTS;
        document.getElementById("p_address").innerHTML = '<span class="material-icons">location_on</span>ADDRESS<br>&nbsp&nbsp' + item.ADDR1 + '<br><br>';

        if (item.MIDDLE_SIZE_RM1 != '') {
            if (nowLanguage == 2) {
                document.getElementById("welfare").innerHTML = '<span class="material-icons">accessible_forward</span>WELFARE<br>' + item.MIDDLE_SIZE_RM1.replaceAll('、', '&nbsp&nbsp<br>');
            }
            else {
                document.getElementById("welfare").innerHTML = '<span class="material-icons">accessible_forward</span>WELFARE<br>' + item.MIDDLE_SIZE_RM1.replaceAll(', ', '&nbsp&nbsp<br>');
            }
        }
        else {
            document.getElementById("welfare").innerHTML = '';
        }

        if (item.CNTCT_TEL != '') {
            document.getElementById("p_call").innerHTML = '<span class="material-icons">phone_in_talk</span>CALL<br>&nbsp&nbsp' + item.CNTCT_TEL;
        }
        else {
            document.getElementById("p_call").innerHTML = '';
        }
        
    }
    //오른쪽의 세부사항을 선택한 item의 내용으로 변경하는 함수 (맛집에 대한 설명).
    function makeFoodDetail(item) {
        let tTitle = item.TITLE;
        if (tTitle == '') {
            tTitle = temp.SUBTITLE;
        }
        if (nowLanguage != 0) {
            tTitle = omitKor(tTitle);
        }
        document.getElementById(content[nowMenu]).firstElementChild.innerText = tTitle;
        document.getElementById("photo").src = item.MAIN_IMG_THUMB;
        document.getElementById("photo").style.display = "initial";
        document.getElementById("view").style.display = "none";
        document.getElementById("available").innerHTML = '<span class="material-icons">date_range</span>AVAILABLE<br>&nbsp&nbsp' + item.USAGE_DAY_WEEK_AND_TIME;
        document.getElementById("menu").innerHTML = '<span class="material-icons">restaurant_menu</span>MENU<br>&nbsp&nbsp' + item.RPRSNTV_MENU;
        document.getElementById("detail").innerHTML = item.ITEMCNTNTS;
        document.getElementById("address").innerHTML = '<span class="material-icons">location_on</span>ADDRESS<br>&nbsp&nbsp' + item.ADDR1;
        document.getElementById("call").innerHTML = '<span class="material-icons">phone_in_talk</span>CALL<br>&nbsp&nbsp' + item.CNTCT_TEL;
    }
    //지도 api에 maker를 표시하기 위한 옵션을 설정하는 Set 함수
    function setPlaceMarker(item) {
        var location = new naver.maps.LatLngBounds(new naver.maps.LatLng(item.LAT - 0.005, item.LNG - 0.003), new naver.maps.LatLng(item.LAT + 0.005, item.LNG + 0.003));
        mapObject.panToBounds(location);
        if (placeMarker == null) {
            placeMarker = new naver.maps.Marker({
                position: new naver.maps.LatLng(item.LAT, item.LNG),
                map: mapObject
            });
        }
        else {
            placeMarker.setPosition(new naver.maps.LatLng(item.LAT, item.LNG));
        }
    }
    // api로 얻은 데이터를 바탕으로 지도에 표시할 maker의 객체를 만들고 전역변수 리스트에 저장
    function makeChargerMark() {
        for(var i = 0; i < charger_info.length; i++){
            var markerOptions = {
                position: new naver.maps.LatLng(charger_info[i].lat, charger_info[i].lng),
                map: mapObject,
                icon: {
                    url: './charge_marker.png',
                    size: new naver.maps.Size(40, 50),
                    scaledSize: new naver.maps.Size(40, 40),
                    origin: new naver.maps.Point(0, 0),
                    anchor: new naver.maps.Point(40, 50),
                },
                visible: chargerMarkerVisible
            };
            var marker = new naver.maps.Marker(markerOptions);
            chargerMarkers.push(marker);
        }
    }
    //지도에 마커를 On/Off할 때 마커의 visible attribute를 설정하는 함수
    function setChargerMarker() {
        var button = document.getElementsByClassName('category_button')[2];
        if(chargerMarkerVisible) {
            button.style.background = 'black';
        }
        else {
            button.style.background = 'green';
        }
        chargerMarkerVisible = !chargerMarkerVisible;
        for( var i = 0; i < chargerMarkers.length; i++) {
            var markerOptions = {
                visible: chargerMarkerVisible
            };
            chargerMarkers[i].setOptions(markerOptions);
        }
    }

    // 데이터의 언어를 바꾸는 함수. 좌측 리스트를 초기화하고 새로 만든다.
    function changeLanguage() {
        search.keyword.value = '';

        document.getElementsByClassName(menu[nowMenu])[nowLanguage].style.display = "none";
        nowLanguage = (nowLanguage + 1) % 3;
        document.getElementsByClassName(menu[nowMenu])[nowLanguage].style.display = "block";

        document.getElementsByClassName('lang_button')[nowMenu].firstChild.src = flagImages[nowLanguage];
        document.getElementsByClassName('lang_button')[nowMenu].childNodes[1].innerText = language[nowLanguage];
        viewListDetails(lastSelect);
    }
    //왼쪽 위의 메뉴버튼을 눌렀을 때, list의 종류를 면경해주는 함수.
    function changeMenu(num){
        if(nowMenu != num){
            document.getElementsByClassName(menu[nowMenu])[nowLanguage].style.display = "none";
            document.getElementsByClassName(menu[nowMenu])[3].style.display = "none";
            document.getElementById(content[nowMenu]).style.display = "none";
            nowMenu = num;
            document.getElementsByClassName('lang_button')[nowMenu].firstChild.src = flagImages[nowLanguage];
            document.getElementsByClassName('lang_button')[nowMenu].childNodes[1].innerText = language[nowLanguage];
            document.getElementsByClassName(menu[nowMenu])[3].style.display = "none";
            document.getElementsByClassName(menu[nowMenu])[nowLanguage].style.display = "block";
            document.getElementById(content[nowMenu]).style.display = "block";
            viewListDetails(0);
        }
    }