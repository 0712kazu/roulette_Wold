class SetMyMapClass {
  constructor() {
    this.mymap = L.map("mapid", {
      center: [43.505, -0.09],
      zoom: 2,
    })
    this.style_poly = {
      stroke: true,
      color: "#666",
      weight: 1,
      fillOpacity: 0.8,
      fillColor: "gray",
    }
    this.geojson_poly = L.geoJSON(countryPoly, {
      style: this.style_poly,
      //ポリゴンデータの読み込み
      onEachFeature: (feature, layer) => {
        this._onEachFeature(feature, layer)
        layer.on({
          mouseover: (e) => this._highlightFeature(e),
          mouseout: () => this._resetHighlight(),
          click: (e) => this._zoomClickFeature(e),
        })
      },
    }).addTo(this.mymap)
    // console.log(this.geojson_poly)
    L.control.zoomLabel({ position: "bottomleft" }).addTo(this.mymap)
    this.fitBtnEvent = document.getElementById("zoomstyle")
    this.fitBtnEvent.addEventListener("click", () => {
      this.setViewCenter()
    })
  }

  setViewCenter(){
    this.mymap.setView([43.505, -0.09], 2)
  }

  _highlightFeature(e) {//マウスホバーしたポリゴンに対して境界線の強調表示を行う
    let layer = e.target
    // console.log('hover')
    layer.setStyle({//マウスホバーしたら太字の枠線をつける
      stroke: true,
      color: "#666",
      weight: 4,
      // fillOpacity: 1,
    })
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront()
    }
  }

  _onEachFeature(feature, layer) {
    // console.log("onEach")
    if (feature.properties && feature.properties.jp_name) {
      layer.bindPopup(feature.properties.jp_name)
    }
  }

  _resetHighlight() {
    this.geojson_poly.setStyle({
      weight: 1,
    })
  } 

  async _zoomClickFeature(e) {//クリックした国をハイライトしてズーム
    this.geojson_poly.setStyle({
      fillOpacity: 0.6,
    })
    await e.target.setStyle({
      fillOpacity: 0.2,
      stroke: true,
    })
    return await 
    this.mymap.setView([e.target.feature.properties.lat, e.target.feature.properties.lon],4) 
  }
}
const SetMyMap = new SetMyMapClass()

class SelectCountries {
  constructor() {
    this.countryList = []
    this.roulette = null
    this.text = null
    this.jsonObj = null
    this.selectCountryName = null
    this.marker = null
    this._makeCountryList()
    this.roulette = document.getElementById("roulette")//国名が表示される場所
    this.belong = document.getElementById("belongAnswer") //属国が表示される場所
  }

  _makeCountryList() {//geojson_polyから国名を取得してリスト化
    this.countryNamesBefore = countryPoly.features
      .map((feature) => {//国名が入っていないポリゴンは除外する。
        if (feature.properties.jp_name != null) {
          return feature.properties.jp_name
        }
      })
      .filter((feature) => feature)//重複を削除
    this.countryList = this.countryNamesBefore.filter(function (x, i, self) {
      return self.indexOf(x) === i
    })
    this.countryUltimateList = this.countryList.slice()

  }

  _getCountryNum(){
    this.selectNum = Math.floor(Math.random() * this.countryUltimateList.length) //リストをランダムに選択
  }
  _dispCountryNameOnScreen(){
    this.roulette.textContent = `${this.selectCountryName}` //国名を画面に表示させる。
  }

  _dispBelongNameOnScreen(){//属国を画面に表示させる。
    this.selectCountryBelong = this.selectCountryProperties.properties.belong
    if (this.selectCountryProperties.properties.belong != null) {
      this.belong.textContent =`${this.selectCountryProperties.properties.belong}` + `領` 
    }
  }

  _getSelectCountryProperties(){
    this.selectCountryProperties = countryPoly.features.find((feature) => {
      return feature.properties.jp_name === this.selectCountryName
    })
  }
  _getSelectCountryName(){
    this.selectCountryName = this.countryUltimateList[this.selectNum] //選ばれた国名をリストから文字列で変数に代入
  }

  _addMarker() {//マーカーを表示
    this.marker = L.marker(
      [this.selectCountryProperties.properties.lat,
      this.selectCountryProperties.properties.lon], 
      { opacity: 0.8 }
      ).addTo(SetMyMap.mymap) 
  }

  _checkLastCountryList() {
    if (this.countryUltimateList.length === 0) {
      this.countryUltimateList = this.countryList.slice()
    }
  }
  //ランダムに国を選んでその属性と同じポリゴンの色を変える。
  _changeColorSelectPoly() {
    SetMyMap.geojson_poly.eachLayer((layer) => {
      if (layer.feature.properties.jp_name == this.selectCountryName) {
        layer.setStyle({
          fillColor: "red",
          fillOpacity: 1,
        })
      }
    })
  }

  selectCountries() {
    this._getCountryNum()
    this._getSelectCountryName()
    this._dispCountryNameOnScreen()
    this._getSelectCountryProperties()
    this._addMarker()
    this._changeColorSelectPoly()
  }
  
  selectLastcountry() { 
    this.selectCountries()
    this.countryUltimateList.splice(this.selectNum,1)[0] 
    this._dispBelongNameOnScreen()
    this._checkLastCountryList()
  }

  viewLastcountry() {
    this.roulette.textContent = "答え： " + `${this.selectCountryName}` //国名を画面に表示させる。
  }

  removeMarker() {
    if (this.marker) {
      this.marker.remove(SetMyMap.mymap)
    }
  }

  async clearColorSelectPoly() {//つけた色を消す
    return await this.removeMarker(
      SetMyMap.geojson_poly.setStyle({
        weight: 1,
        fillOpacity: 0.6,
        fillColor: "gray",
      })
    )
  }

  clearRouletteText() {
    this.roulette.textContent = `` //国名を一旦消す。
    this.belong.textContent = ``
  }

  zoomLastSelectedCountry(layer) {//セレクトされた国をズーム
    SetMyMap.geojson_poly.eachLayer((layer) => {
      if (layer.feature.properties.jp_name == this.selectCountryName) {
        SetMyMap.mymap.setView(
          [layer.feature.properties.lat, layer.feature.properties.lon],
          4
        ) 
      }
    })
  }

  countDown() {
    this.totalTime = 5000
    this.oldTime = Date.now()
    this.timeId = setInterval(() => {
      this.currentTime = Date.now()
      this.diff = this.currentTime - this.oldTime // 差分を求める
      this.diffSec = this.totalTime - this.diff
      this.remainSec = Math.ceil(this.diffSec / 1000) //ミリ秒を整数に変換
      this.text = `${this.remainSec}`
      if (this.diffSec <= 0) {
        // 0秒以下になったら
        clearInterval(this.timeId)
        this.text = "" // タイマー終了
      }
      document.querySelector("#count_down").innerHTML = this.text // 画面に表示する
    })
  }
}

const selectcountryInstance = new SelectCountries()

class AudioClass {
  constructor() {
    this.speacker = document.getElementById("speaker_icon") //スピーカーのアイコンの読み込み
    //音の読み込み
    this.musicIntro = new Audio("audio/intro_part2.mp3")
    this.musicSelected = new Audio("audio/select_part2.mp3")
    this.musicCountDown = new Audio("audio/think_part2.mp3")
    this.loop = null
    this.vl = 0.3
  }

  offSpeaker() {
    //実はオフにしても裏でイントロは流れている。
    this.speacker.classList.remove("speaker_on")
    this.speacker.src = "img/icon_120980_256.png"
    this.musicIntro.muted = true
    this.typeCountMute()
  }

  onSpeaker() {
    this.speacker.classList.add("speaker_on")
    this.speacker.src = "img/icon_120970_256.png"
    this.typeCountVolUp()
  }

  playIntroMusic() {
    this.introOn()
    this.musicIntro.muted = false
    this.musicIntro.volume = 0.1
    this.loop = window.setInterval(() => {
      // this.musicIntro.pause();
      this.introOn()
      // },36200)//intro.mp3の場合
    }, 8748) //intro_part2.mp3の場合(BPM110:4小節)
  }

  introOn() {
    this.musicIntro.currentTime = 0
    this.musicIntro.play()
  }

  typeCountMute() {
    this.musicSelected.muted = true
    this.musicCountDown.muted = true
  }

  typeCountVolUp() {
    this.musicSelected.muted = false
    this.musicCountDown.muted = false
    this.musicSelected.volume = 0.25
    this.musicCountDown.volume = 0.25
  }

  
  _selectTimeMusicPlay() {
    this.musicSelected.currentTime = 0
    this.musicSelected.play()
  }

  async _setCountdownMusic(){//chrome用エラー回避（play()とpause()は同時に書かない）。
    return await this.musicCountDown.pause(
      this.musicCountDown.play()
    )}

  selectTimeMusic() {
    this.musicIntro.muted = true
    this._setCountdownMusic()
    this.musicCountDown.muted = true
    this.musicCountDown.currentTime = 0
    this._selectTimeMusicPlay()
    if (this.speacker.className === "speaker_on") {
      this.typeCountVolUp()
    } else {
      this.typeCountMute()
    }
    window.setTimeout(() => {
      //this.musicCountDownが終わるタイミングとボタンの復帰をずらすためここにsettimeoutする。
      this.musicCountDown.play()
    }, 2000)
  }
}

const audio = new AudioClass()

class Flags{
  constructor(){
    this.countryCodeList = []
    this.flugContainer = document.getElementById("flug_conteiner")
    // this.img = document.getElementsByClassName("flags");
    // console.log(this.img[0])
    this._makeCountryCodeList()
    this.imgDivDict = {}
    this.promises = this.countryUltimateCodeList.map((name) => this.makeImage(name))
    // console.log("promises", this.promises)
    Promise.all(this.promises).then((ress) => {
    // console.log(" ress", ress)
    ress.forEach((res, idx) => {
      this.imgDivDict[this.countryUltimateCodeList[idx]] = res
      res.src = `img/flags/${this.countryUltimateCodeList[idx]}@3x.png`
      })
      // console.log("imgs", this.imgDivDict)
    })
  }

  _makeCountryCodeList() {//geojson_polyから国名を取得してリスト化
    this.isoProperties = countryPoly.features.map((feature) => {//国名が入っていないポリゴンは除外する。
      if (feature.properties.iso2 != null) {
        return feature.properties.iso2
      }
    })
      .filter((feature) => feature)//重複を削除
    this.countryCodeList = this.isoProperties.filter(function (x, i, self) {
      return self.indexOf(x) === i
    })
    this.countryUltimateCodeList = this.countryCodeList.slice()

    // console.log(this.countryUltimateCodeList)
  }

  makeImage(name) {
    return new Promise((resolve) => {
      // console.log(`${name} img.onload`)
      this.img_element = document.createElement("img")
      resolve(this.img_element)
    })
  }
  
  chengeFlags(iso2){
    this.flugContainer.innerHTML = ''
    this.flugContainer.appendChild(this.imgDivDict[iso2])
  }

}
const flags = new Flags

class RunTheApp{
  constructor() {
    this.btn = document.getElementById("btn_id")
    this.speacker = document.getElementById("speaker_icon") //スピーカーのアイコンの読み込み
    this.autoPlayBtn = document.getElementById("auto_play") //autoボタンの読み込み
    this.autoStopBtn = document.getElementById("auto_stop") //stopボタンの読み込み
    this._rouletteBtnEvents()
    this._speakerBtnEvents()
    this._playAuto()
    this._stopAuto()
  }
  _speakerBtnEvents(){
    this.speacker.addEventListener("click", () => {
      clearInterval(audio.loop)
      if (this.speacker.className === "speaker_on") {
        audio.offSpeaker() //disabledがtrueでもfalse でも同じなのでは判定はなし
      } else {
        if (this.btn.classList.contains("disabled") == true) {
          audio.onSpeaker()
        } else {
          audio.onSpeaker()
          audio.playIntroMusic()
        }
      }
    })
  }

  _roulette(){
    audio.selectTimeMusic()
    selectcountryInstance.removeMarker()
    selectcountryInstance.clearRouletteText()
    // flags.clearFlag()
    this.btn.classList.add("disabled")
    SetMyMap.setViewCenter()
    this.interval = window.setInterval(() => {
      selectcountryInstance.clearColorSelectPoly()
      selectcountryInstance.selectCountries()
      flags.chengeFlags(selectcountryInstance.selectCountryProperties.properties.iso2)
    }, 80)

    window.setTimeout(() => {
      //カウントダウンが始まる
      clearInterval(this.interval)
      selectcountryInstance.clearColorSelectPoly()
      selectcountryInstance.removeMarker()
      selectcountryInstance.selectLastcountry()
      flags.chengeFlags(selectcountryInstance.selectCountryProperties.properties.iso2)
      selectcountryInstance.countDown()
      selectcountryInstance.clearRouletteText()
      selectcountryInstance.zoomLastSelectedCountry()

      window.setTimeout(() => {
        //答えが出てもとに戻る
        this.btn.classList.remove("disabled")
        selectcountryInstance.viewLastcountry()
        SetMyMap.setViewCenter()
        clearInterval(audio.loop)
        if (this.speacker.className === "speaker_on") {
          audio.playIntroMusic()
        }
      }, 5000)
    }, 2000)
  }
  
  _rouletteBtnEvents(){
    this.btn.addEventListener("click", () => {//クリックしたらルーレットがはじまる。
      this._roulette()
    })
  }
  
  _playAuto(){
    this.autoPlayBtn.addEventListener("click", () => {
      this._roulette()
      // console.log('auto')
      this.Playinterval = window.setInterval(() => {
        this._roulette()
      },10000)
    })
  }
  
  _stopAuto(){
    this.autoStopBtn.addEventListener("click", () => {
      // console.log('stop')
      clearInterval(this.Playinterval)
    })
  }
}

const runApp = new RunTheApp()

class SearchBtnEvent{
  constructor(countryUltimateList,geojson_poly){
    this.textbox = document.getElementById("inText");
    this.searchBtn = document.getElementById('searchBtn')
    this.searchBtnClickEvent()
    this.list=countryUltimateList
    this.geojson_poly = geojson_poly
    // console.log('serch:'+countryUltimateList)
  }

  searchBtnClickEvent(){
    this.searchBtn.addEventListener('click',() =>{
      this.inputValue = this.textbox.value;
      SetMyMap.geojson_poly.eachLayer((layer) => {
        layer.setStyle({
          stroke: true,
          color: "#666",
          weight: 1,
          fillOpacity: 0.8,
          fillColor: "gray",
            })
        // if (this.inputValue == layer.feature.properties.jp_name ) {
        if (layer.feature.properties.jp_name.indexOf(this.inputValue) !== -1 ) {
          layer.setStyle({
            fillColor: "red",
            fillOpacity: 1,
          })
          SetMyMap.mymap.setView([layer.feature.properties.lat, layer.feature.properties.lon],4) 
          // layer.bindPopup(layer.feature.properties.jp_name)
        }
      })
    })
  }

  async _zoomClickFeature(e) {//クリックした国をハイライトしてズーム
    this.geojson_poly.setStyle({
      fillOpacity: 0.6,
    })
    await e.target.setStyle({
      fillOpacity: 0.2,
      stroke: true,
    })
    return await 
    this.mymap.setView([e.target.feature.properties.lat, e.target.feature.properties.lon],4) 
  }
}

class searchVue{
  constructor(){
    this.search.mount("#search")
  }
  search = Vue.createApp({
    data() {
      return {
        inputValue: "",
        searchItems: [],
        textError:'2文字以上で入力してください。'
      }
    },
    computed:{
      isInValidName(){
        //文字列が2文字以上かチェックする
        return this.inputValue.length < 2 && this.inputValue.length > 0;
      },
      validName(){
        return this.inputValue.length > 1;
      } 
    },
    methods: {
      clearItems(){
        this.searchItems=[]
      },
      searchBtnClick() {
        this.searchItems=[]
        if (!(this.inputValue.length > 1)) {
          return
        }
        // this.searchItems.push({
        //   text: this.inputValue
        // })
        // console.log(this.searchItems)
        SetMyMap.geojson_poly.eachLayer((layer) => {
          if (layer.feature.properties.jp_name.indexOf(this.inputValue)!= -1){
            this.searchItems.push({
              text: layer.feature.properties.jp_name
            })
          }
        })
        // this.inputValue.forEach(word =>{
        // })
        this.inputValue = ""
      },
      resultCandidate(){
        this.searchItems.push({
          text: this.inputValue
        })
        // console.log(this.searchItems)
        // this.inputValue = ""
        console.log(this.searchItems)
        this.inputValue = ""

      },
      resultClick(){
        this.searchItems=[]
        SetMyMap.geojson_poly.eachLayer((layer) => {
          layer.setStyle({
            stroke: true,
            color: "#666",
            weight: 1,
            fillOpacity: 0.8,
            fillColor: "gray",
              })
          if (layer.feature.properties.jp_name.indexOf(this.searchItems['0']['text']) !== -1 ) {
            layer.setStyle({
              fillColor: "red",
              fillOpacity: 1,
            })
            SetMyMap.mymap.setView([layer.feature.properties.lat, layer.feature.properties.lon],4) 
          }
        })
      }
    }
  })
}
const search = new searchVue()
