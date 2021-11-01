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
      //ポリゴンデータの読み込み
      style: this.style_poly,
      onEachFeature: (feature, layer) => {
        // console.log(layer)
        // console.log(feature)
        this.onEachFeature(feature, layer)
        layer.on({
          mouseover: (e) => this.highlightFeature(e),
          mouseout: () => this.resetHighlight(),
          click: (e) => this.zoomClickFeature(e),
        }) // <<-----------------------
      },
    }).addTo(this.mymap)
    console.log(this.geojson_poly)
    L.control.zoomLabel({ position: "bottomleft" }).addTo(this.mymap)
    this.fitBtnEvent = document.getElementById("zoomstyle")
    this.fitBtnEvent.addEventListener("click", () => {
      this.mymap.setView([43.505, -0.09], 2)
    })
  }

  highlightFeature(e) {
    //マウスホバーしたポリゴンに対して境界線の強調表示を行う
    let layer = e.target // <<-----------------------
    layer.setStyle({
      //マウスホバーしたら太字の枠線をつける
      stroke: true,
      color: "#666",
      weight: 4,
      // fillOpacity: 1,
    })
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront()
    }
  }

  onEachFeature(feature, layer) {
    // console.log("onEach")
    if (feature.properties && feature.properties.jp_name) {
      layer.bindPopup(feature.properties.jp_name)
    }
  }

  resetHighlight() {
    this.geojson_poly.setStyle({
      weight: 1,
    })
  } // <<-----------------------

  async zoomClickFeature(e) {//クリックした国をハイライトしてズーム
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
    this.selectCountry = null
    this.marker = null
    this.makeCountryList()
    this.roulette = document.getElementById("roulette")//国名が表示される場所
    this.belong = document.getElementById("belongAnswer") //属国が表示される場所

  }

  //geojson_polyから国名を取得してリスト化
  makeCountryList() {
    this.countryNamesBefore = countryPoly.features
    //国名が入っていないポリゴンは除外する。
      .map((feature) => {
        if (feature.properties.jp_name != null) {
          return feature.properties.jp_name
        }
      })
      .filter((feature) => feature)
      //重複を削除
    this.countryList = this.countryNamesBefore.filter(function (x, i, self) {
      return self.indexOf(x) === i
    })
    this.countryUltimateList = this.countryList.slice()
    // console.log(this.countryUltimateList)
  }

  //マーカーを表示
  addMarker(lat, lon) {
    this.marker = L.marker([lat, lon], { opacity: 0.8 }).addTo(SetMyMap.mymap) 
  }

  selectCountries() {
    this.selectNum = Math.floor(Math.random() * this.countryUltimateList.length) //リストをランダムに選択
    this.selectCountry = String(this.countryUltimateList[this.selectNum]) //選ばれた国名をリストから文字列で変数に代入
    this.roulette.textContent = `${this.selectCountry}` //国名を画面に表示させる。
    this.selectCountryProperties = countryPoly.features.find((feature) => {
      return feature.properties.jp_name === this.selectCountry
    })
    if (this.selectCountryProperties) {
      this.addMarker(
        this.selectCountryProperties.properties.lat,
        this.selectCountryProperties.properties.lon
      )
    }
  }

  lastSelectcountry() {
    this.rondomNum = Math.floor(Math.random() * this.countryUltimateList.length)//国名をランダム
    this.selectCountry = this.countryUltimateList.splice(this.rondomNum,1)[0] 
    this.roulette.textContent = `${this.selectCountry}` //国名を画面に表示させる。
    // console.log(this.selectCountry)
    this.selectCountryProperties = countryPoly.features.find((feature) => {
      return feature.properties.jp_name === this.selectCountry
    })
    // console.log(this.selectCountryProperties)
    this.selectCountryBelong = this.selectCountryProperties.properties.belong
    if (this.selectCountryProperties.properties.belong != null) {
      this.belong.textContent =
        `${this.selectCountryProperties.properties.belong}` + `領` //国名を画面に表示させる。
    }
    this.addMarker(
      this.selectCountryProperties.properties.lat,
      this.selectCountryProperties.properties.lon
    )
  }

  checkLastCountryList() {
    if (this.countryUltimateList.length === 0) {
      this.countryUltimateList = this.countryList.slice()
    }
  }

  changeColorLastSelectPoly() {
    this.lastSelectcountry()
    SetMyMap.geojson_poly.eachLayer((layer) => {
      if (layer.feature.properties.jp_name == this.selectCountry) {
        layer.setStyle({
          fillColor: "red",
          fillOpacity: 1,
        })
      }
    })
  }
  //ランダムに国を選んでその属性と同じポリゴンの色を変える。
  changeColorSelectPoly() {
    this.selectCountries()
    SetMyMap.geojson_poly.eachLayer((layer) => {
      if (layer.feature.properties.jp_name == this.selectCountry) {
        layer.setStyle({
          fillColor: "red",
          fillOpacity: 1,
        })
      }
    })
  }

  viewLastcountry() {
    this.roulette.textContent = "答え： " + `${this.selectCountry}` //国名を画面に表示させる。
  }


  removeMarker() {
    if (this.marker) {
      this.marker.remove(SetMyMap.mymap)
      // console.log('remove')
    }
  }

  async clearColorSelectPoly() {
    //つけた色を消す
    return await this.removeMarker(
      SetMyMap.geojson_poly.setStyle({
        // stroke:false,
        weight: 1,
        fillOpacity: 0.6,
        fillColor: "gray",
      })
    )
  }

  clearRouletteText() {
    this.roulette.textContent = `` //国名を一旦消す。
  }

  zoomLastSelectCountry(layer) {
    SetMyMap.geojson_poly.eachLayer((layer) => {
      if (layer.feature.properties.jp_name == this.selectCountry) {
        SetMyMap.mymap.setView(
          [layer.feature.properties.lat, layer.feature.properties.lon],
          4
        ) //セレクトされた国をズーム
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

const selectCtyInstance = new SelectCountries()

class AudioClass {
  constructor() {
    this.speacker = document.getElementById("speaker_icon") //スピーカーのアイコンの読み込み
    //音の読み込み
    this.musicIntro = new Audio("audio/intro_part2.mp3")
    this.musicSelected = new Audio("audio/select_part2.mp3")
    this.musicCountDown = new Audio("audio/think_part2.mp3")
    this.loop = null
    this.vl = 0.3
    this.btn = document.getElementById("btn_id")
    this.speacker.addEventListener("click", () => {
      clearInterval(this.loop)
      if (this.speacker.className === "speaker_on") {
        this.offSpeaker() //disabledがtrueでもfalse でも同じなのでは判定はなし
      } else {
        if (this.btn.classList.contains("disabled") == true) {
          this.onSpeaker()
        } else {
          this.onSpeaker()
          this.playIntroMusic()
        }
      }
    })

    this.btn.addEventListener("click", () => {
      //クリックしたらルーレットがはじまる。
      this.selectMusic()
      selectCtyInstance.removeMarker()
      this.btn.classList.add("disabled")
      SetMyMap.mymap.setView([43.505, -0.09], 2)
      // layer.closePopup()
      // this.btn.disabled = true;//ボタンdisable
      document.querySelector("#belongAnswer").innerHTML = ""
      this.interval = window.setInterval(() => {
        selectCtyInstance.clearColorSelectPoly()
        selectCtyInstance.changeColorSelectPoly()
        // window.setTimeout(() =>{
        //   selectCtyInstance.removeMarker();
        // },50)
      }, 80)

      window.setTimeout(() => {
        //カウントダウンが始まる
        clearInterval(this.interval)
        // voiceOn();
        // this.musicCountDown.play();
        selectCtyInstance.clearColorSelectPoly()
        selectCtyInstance.removeMarker()
        selectCtyInstance.changeColorLastSelectPoly()
        selectCtyInstance.countDown()
        selectCtyInstance.clearRouletteText()
        selectCtyInstance.zoomLastSelectCountry()

        window.setTimeout(() => {
          //答えが出てもとに戻る
          this.btn.classList.remove("disabled")
          // this.btn.disabled = false;
          // selectCtyInstance.selectCountries();
          selectCtyInstance.viewLastcountry()
          selectCtyInstance.checkLastCountryList()
          SetMyMap.mymap.setView([43.505, -0.09], 2)
          // recognition.stop()
          clearInterval(this.loop)
          if (this.speacker.className === "speaker_on") {
            this.playIntroMusic()
          }
        }, 5000)
      }, 2000)
    })
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
    }, 8740) //intro_part2.mp3の場合(BPM110:4小節)
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

  selectMusicPlay() {
    this.musicSelected.currentTime = 0
    this.musicSelected.play()
  }

  selectMusic() {
    this.musicIntro.muted = true
    this.musicCountDown.play()
    this.musicCountDown.muted = true
    // this.musicCountDown.pause();
    this.musicCountDown.currentTime = 0
    window.setTimeout(() => {
      //chrome用エラー回避（play()とpause()は同時に書かない）。
      this.musicCountDown.pause()
    }, 1)
    this.selectMusicPlay()
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
