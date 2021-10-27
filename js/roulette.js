class SetMyMapClass {
  constructor() {
    this.evs = {
      highlightFeature: (e) => this.highlightFeature(e),
      resetHighlight: () => this.resetHighlight(),
      zoomClickFeature: (e) => this.zoomClickFeature(e),
    } // <<-----------------------
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
        this.onEachFeature(feature, layer)
        layer.on({
          mouseover: this.evs.highlightFeature,
          mouseout: this.evs.resetHighlight,
          click: this.evs.zoomClickFeature,
        }) // <<-----------------------
      },
    }).addTo(this.mymap)
    console.log(this.geojson_poly)
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

  zoomClickFeature(e) {
    // クリックした国を全体表示してズーム
    const center = [
      [e.target._bounds._northEast.lat, e.target._bounds._northEast.lng],
      [e.target._bounds._southWest.lat, e.target._bounds._southWest.lng],
    ]
    this.geojson_poly.setStyle({
      fillOpacity: 0.6,
      // stroke:false
    })
    e.target.setStyle({
      fillOpacity: 0.2,
      stroke: true,
    })
    window.setTimeout(() => {
      //少しだけタイムラグをつけてあげないと表示が同時に行われてしまう。
      this.mymap.fitBounds(center, 5)
    }, 100)
  }
}
const SetMyMap = new SetMyMapClass()

// let countrysClick = null;

L.control.zoomLabel({ position: "bottomleft" }).addTo(SetMyMap.mymap)

const fitlayer = () => {
  //全体表示
  const fitBtnEvent = document.getElementById("zoomstyle")
  fitBtnEvent.addEventListener("click", () => {
    SetMyMap.mymap.setView([43.505, -0.09], 2)
  })
}
fitlayer()

class SelectClass {
  constructor() {
    this.countryList = []
    this.roulette = null
    this.text = null
    this.jsonObj = null
    this.selectCountry = null
    this.marker = null
  }

  makeCountryList() {
    //geojson_polyから国名を取得してリスト化
    this.countryNamesBefore = countryPoly.features
      .map((feature) => {
        if (feature.properties.jp_name != null) {
          //国名が入っていないポリゴンは除外する。
          return feature.properties.jp_name
        }
      })
      .filter((feature) => feature)
    this.countryList = this.countryNamesBefore.filter(function (x, i, self) {
      //重複を削除
      return self.indexOf(x) === i
    })
    this.countryLastList = this.countryList.slice()
    // console.log(this.countryLastList)
  }

  addMarker(lat, lon) {
    //マーカーを表示
    this.marker = L.marker([lat, lon], { opacity: 0.8 }).addTo(SetMyMap.mymap) //マーカーをうつ
  }

  selectCountries() {
    this.roulette = document.getElementById("roulette")
    this.selectNum = Math.floor(Math.random() * this.countryList.length) //国コードをランダム
    this.selectCountry = String(this.countryList[this.selectNum]) //選ばれた国名をリストから文字列で変数に代入
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
    this.roulette = document.getElementById("roulette")
    this.belong = document.getElementById("belongAnswer") //答えが同じものが出ない様に調整
    this.selectLastCountry = this.countryLastList.splice(
      Math.floor(Math.random() * this.countryLastList.length),
      1
    )[0] //国コードをランダム
    this.roulette.textContent = `${this.selectLastCountry}` //国名を画面に表示させる。
    this.selectCountryProperties = countryPoly.features.find((feature) => {
      return feature.properties.jp_name === this.selectLastCountry
    })
    console.log(this.selectCountryProperties)
    this.selectCountryBelong = this.selectCountryProperties.properties.belong
    this.addMarker(
      this.selectCountryProperties.properties.lat,
      this.selectCountryProperties.properties.lon
    )
    if (this.selectCountryProperties.properties.belong != null) {
      this.belong.textContent =
        `${this.selectCountryProperties.properties.belong}` + `領` //国名を画面に表示させる。
    }
  }

  checkLastCountryList() {
    if (this.countryLastList.length === 0) {
      this.countryLastList = this.countryList.slice()
    }
  }

  changeColorLastSelectPoly() {
    //答えが同じものが出ない様に調整
    this.lastSelectcountry()
    SetMyMap.geojson_poly.eachLayer((layer) => {
      if (layer.feature.properties.jp_name == this.selectLastCountry) {
        // console.log('レイヤー：'+layer.feature.properties.jp_name)
        // console.log('文字表示２：'+this.selectCountry)
        layer.setStyle({
          fillColor: "red",
          fillOpacity: 1,
          // stroke:false
        })
      }
    })
  }

  viewLastcountry() {
    this.roulette = document.getElementById("roulette")
    this.roulette.textContent = "答え： " + `${this.selectLastCountry}` //国名を画面に表示させる。
  }

  changeColorSelectPoly() {
    //ランダムに国を選んでその属性と同じポリゴンの色を変える。
    this.selectCountries()
    SetMyMap.geojson_poly.eachLayer((layer) => {
      if (layer.feature.properties.jp_name == this.selectCountry) {
        // console.log('レイヤー：'+layer.feature.properties.name)
        // console.log('文字表示２：'+this.selectCountry)
        layer.setStyle({
          fillColor: "red",
          fillOpacity: 1,
          // stroke:false
        })
      }
    })
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
      if (layer.feature.properties.jp_name == this.selectLastCountry) {
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

const selectCtyInstance = new SelectClass()
selectCtyInstance.makeCountryList()

//音の読み込み
const musicIntro = new Audio("audio/intro_part2.mp3")
const musicSelected = new Audio("audio/select_part2.mp3")
const musicCountDown = new Audio("audio/think_part2.mp3")

class AudioClass {
  constructor() {
    this.speacker = document.getElementById("speaker_icon") //スピーカーのアイコンの読み込み
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
        // musicCountDown.play();
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
    musicIntro.muted = true
    this.typeCountMute()
  }

  onSpeaker() {
    this.speacker.classList.add("speaker_on")
    this.speacker.src = "img/icon_120970_256.png"
    this.typeCountVolUp()
  }

  playIntroMusic() {
    this.introOn()
    musicIntro.muted = false
    musicIntro.volume = 0.1
    this.loop = window.setInterval(() => {
      // musicIntro.pause();
      this.introOn()
      // },36200)//intro.mp3の場合
    }, 8740) //intro_part2.mp3の場合(BPM110:4小節)
  }

  introOn() {
    musicIntro.currentTime = 0
    musicIntro.play()
  }

  typeCountMute() {
    musicSelected.muted = true
    musicCountDown.muted = true
  }

  typeCountVolUp() {
    musicSelected.muted = false
    musicCountDown.muted = false
    musicSelected.volume = 0.25
    musicCountDown.volume = 0.25
  }

  selectMusicPlay() {
    musicSelected.currentTime = 0
    musicSelected.play()
  }

  selectMusic() {
    musicIntro.muted = true
    musicCountDown.play()
    musicCountDown.muted = true
    // musicCountDown.pause();
    musicCountDown.currentTime = 0
    window.setTimeout(() => {
      //chrome用エラー回避（play()とpause()は同時に書かない）。
      musicCountDown.pause()
    }, 1)
    this.selectMusicPlay()
    if (this.speacker.className === "speaker_on") {
      this.typeCountVolUp()
    } else {
      this.typeCountMute()
    }
    window.setTimeout(() => {
      //musicCountDownが終わるタイミングとボタンの復帰をずらすためここにsettimeoutする。
      musicCountDown.play()
    }, 2000)
  }
}

const audio = new AudioClass()
