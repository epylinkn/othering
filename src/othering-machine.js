import p5 from 'p5';
import 'p5/lib/addons/p5.sound';
import 'p5/lib/addons/p5.dom';
// import "./assets/p5.serialport"; // doesn't work with webpack =[
import _ from 'lodash';

require('./assets/main.scss');

const sketch = (p5) => {
  window.p5 = p5;

  const DEBUG_FLAG = false;
  var serial;
  var key;

  var step = 0;
  var clips;
  var clip1 = require('./assets/clip1.mp4');
  var clip2 = require('./assets/clip2.mp4');
  var clip3Vegans = require('./assets/clip3-vegans.mp4');
  var clip3Lefties = require('./assets/clip3-lefties.mp4');
  var clip3Beliebers = require('./assets/clip3-beliebers.mp4');
  var clip4Vegans = require('./assets/clip4-vegans.mp4');
  var clip4Lefties = require('./assets/clip4-lefties.mp4');
  var clip4Beliebers = require('./assets/clip4-beliebers.mp4');
  var clip5 = require('./assets/clip5.mp4');
  var clip6 = require('./assets/clip6.mp4');
  var clipGrid = require("./assets/clip-grid.mp4");
  var clipDone = require('./assets/clip-done.mp4');
  var newStep = true;

  var videoIndex = 0;
  var width;
  var length;
  var grid;

  var bgTitle;
  var bgGray;
  var bgBlack;
  var bgGreen;

  var awaitingInteraction = false;

  var narrativeOptions;
  var fakeNews;
  var fakeNewsVideo;
  var fakeNewsVideos = {
    "vegans.illegal": require('./assets/fakenews/vegans.illegal.mov'),
    "vegans.radical": require('./assets/fakenews/vegans.radical.mov'),
    "vegans.militant": require("./assets/fakenews/vegans.militant.mov"),

    "lefties.illegal": require("./assets/fakenews/lefties.illegal.mov"),
    "lefties.radical": require("./assets/fakenews/lefties.radical.mov"),
    "lefties.militant": require("./assets/fakenews/lefties.militant.mov"),

    "beliebers.illegal": require("./assets/fakenews/beliebers.illegal.mov"),
    "beliebers.radical": require("./assets/fakenews/beliebers.radical.mov"),
    "beliebers.militant": require("./assets/fakenews/beliebers.militant.mov"),
  }

  var isSelectingGroup = false;
  var isSelectingLabel = false;
  var isSelectingNarrative = false;
  var groupSelection = 3;
  var labelSelection = 3;
  var narrativeSelection = 2;
  let groupOptions = ['vegans', 'lefties', 'beliebers'];
  var labelOptions = ['radical', 'illegal', 'militant'];
  var narratives;

  p5.preload = () => {
    bgTitle = p5.loadImage(require('./assets/bg-title.jpg'));
    bgGray = p5.loadImage(require('./assets/bg-gray.jpg'));
    bgBlack = p5.loadImage(require('./assets/bg-black.jpg'));
    bgGreen = p5.loadImage(require('./assets/bg-green.jpg'));

    narrativeOptions = p5.loadJSON(require('./assets/narratives.json'));
    fakeNews = p5.loadJSON(require('./assets/fakenews.json'));
  }

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);

    // console.dir(p5.SerialPort);
    // serial = new p5.SerialPort();
    // serial.open("/dev/cu.usbmodem14411");
    //
    // serial.on("connected", function() {
    //   alert('serial connected');
    // });

    clips = {
      clip1: p5.createVideo([clip1]),
      clip2: p5.createVideo([clip2]),
      clip3Vegans: p5.createVideo([clip3Vegans]),
      clip3Lefties: p5.createVideo([clip3Lefties]),
      clip3Beliebers: p5.createVideo([clip3Beliebers]),
      clip4Vegans: p5.createVideo([clip4Vegans]),
      clip4Lefties: p5.createVideo([clip4Lefties]),
      clip4Beliebers: p5.createVideo([clip4Beliebers]),
      clip5: p5.createVideo([clip5]),
      clip6: p5.createVideo([clip6]),
      clipGrid: p5.createVideo([clipGrid]),
      clipDone: p5.createVideo([clipDone])
    }

    _.mapValues(clips, (clip) => { clip.hide() });
  }

  p5.draw = () => {
    let color = p5.color("#c0ffee");
    function debug(text) {
      p5.fill(p5.color("magenta"));
      p5.textFont("Roboto");
      p5.textSize(20);
      p5.textAlign(p5.CENTER);
      p5.text(text, p5.windowWidth / 2, 100);
    }

    function displayBackground(img) {
      p5.image(img, 0, 0, p5.windowWidth, p5.windowHeight);
    }

    function displayTitle(text) {
      p5.fill(color);
      p5.textFont("Roboto");
      p5.textSize(40);
      p5.textStyle("BOLD");
      p5.textAlign(p5.CENTER);
      p5.text(text, p5.windowWidth / 2, p5.windowHeight / 2);
    }

    function displayVideo(videoIndex) {
      // TODO get and keep video aspect ratio: 1280 x 720?
      let videoWidth = 1280;
      let videoHeight = 720;
      let percentageWidth = .70;

      let aspectRatio = videoWidth / videoHeight;
      let horizontalMargin = p5.windowWidth * (1 - percentageWidth) / 2;
      // TODO how do we formula this...
      let verticalMargin = 100;

      p5.image(
        clips[videoIndex],
        horizontalMargin,
        verticalMargin,
        p5.windowWidth - 2 * horizontalMargin,
        p5.windowHeight - 2 * verticalMargin
      );
    }

    function displayFakeNewsSmall(key) {
      let verticalMargin = 203;
      let horizontalMargin = 322;

      p5.image(
        fakeNewsVideo,
        horizontalMargin,
        verticalMargin,
        p5.windowWidth - 2 * horizontalMargin,
        p5.windowHeight - 2 * verticalMargin
      );

      if (key.indexOf("militant") > 0) {
        p5.noStroke();
        p5.fill("blue");
        p5.rect(
          horizontalMargin + 20,
          p5.windowHeight - 2 * verticalMargin + 172,
          p5.windowWidth - 2 * horizontalMargin - 20,
          15
        );

        p5.fill("white");
        p5.textFont("Arial");
        p5.textSize(9);
        p5.textStyle("BOLD");
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.text(
          fakeNews[`${key}.${narrativeSelection}`],
          horizontalMargin + 20,
          p5.windowHeight - 2 * verticalMargin + 172,
          p5.windowWidth - 2 * horizontalMargin - 20,
          15
        );
      } else if (key.indexOf("illegal") > 0) {
        p5.noStroke();
        p5.fill("blue");
        p5.rect(
          horizontalMargin + 41,
          p5.windowHeight - 2 * verticalMargin + 172,
          p5.windowWidth - 2 * horizontalMargin - 45,
          12
        );

        p5.fill("white");
        p5.textFont("Arial");
        p5.textSize(7);
        p5.textStyle("BOLD");
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.text(
          fakeNews[`${key}.${narrativeSelection}`],
          horizontalMargin + 41,
          p5.windowHeight - 2 * verticalMargin + 172,
          p5.windowWidth - 2 * horizontalMargin - 45,
          12
        );
      } else if (key.indexOf("radical") > 0) {
        p5.noStroke();
        p5.fill("#DDDDDD");
        p5.rect(
          horizontalMargin + 31,
          p5.windowHeight - 2 * verticalMargin + 173,
          p5.windowWidth - 2 * horizontalMargin - 46,
          12
        );

        p5.fill("black");
        p5.textFont("Arial");
        p5.textSize(8);
        p5.textStyle("BOLD");
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.text(
          fakeNews[`${key}.${narrativeSelection}`],
          horizontalMargin + 31,
          p5.windowHeight - 2 * verticalMargin + 173,
          p5.windowWidth - 2 * horizontalMargin - 46,
          12
        );
      }
    }

    function displayFakeNews(key) {
      let verticalMargin = 75;
      let horizontalMargin = 100;

      p5.image(
        fakeNewsVideo,
        horizontalMargin,
        verticalMargin,
        p5.windowWidth - 2 * horizontalMargin,
        p5.windowHeight - 2 * verticalMargin
      );

      if (key.indexOf("militant") > 0) {
        p5.noStroke();
        p5.fill("blue");
        p5.rect(
          horizontalMargin + 100,
          p5.windowHeight - 2 * verticalMargin,
          p5.windowWidth - 2 * horizontalMargin - 100,
          50
        );

        p5.fill("white");
        p5.textFont("Arial");
        p5.textSize(28);
        p5.textStyle("BOLD");
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.text(
          fakeNews[`${key}.${narrativeSelection}`],
          horizontalMargin + 100,
          p5.windowHeight - 2 * verticalMargin,
          p5.windowWidth - 2 * horizontalMargin - 100,
          50
        );
      } else if (key.indexOf("illegal") > 0) {
        p5.noStroke();
        p5.fill("blue");
        p5.rect(
          horizontalMargin + 125,
          p5.windowHeight - 2 * verticalMargin - 20,
          p5.windowWidth - 2 * horizontalMargin - 135,
          38
        );

        p5.fill("white");
        p5.textFont("Arial");
        p5.textSize(24);
        p5.textStyle("BOLD");
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.text(
          fakeNews[`${key}.${narrativeSelection}`],
          horizontalMargin + 125,
          p5.windowHeight - 2 * verticalMargin - 20,
          p5.windowWidth - 2 * horizontalMargin - 135,
          38
        );
      } else if (key.indexOf("radical") > 0) {
        p5.noStroke();
        p5.fill("#DDDDDD");
        p5.rect(
          horizontalMargin + 105,
          p5.windowHeight - 2 * verticalMargin - 23,
          p5.windowWidth - 2 * horizontalMargin - 150,
          43
        );

        p5.fill("black");
        p5.textFont("Arial");
        p5.textSize(24);
        p5.textStyle("BOLD");
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.text(
          fakeNews[`${key}.${narrativeSelection}`],
          horizontalMargin + 105,
          p5.windowHeight - 2 * verticalMargin - 23,
          p5.windowWidth - 2 * horizontalMargin - 150,
          43
        );
      }
    }

    function displayOption(text, i, width, active) {
      if (active) {
        p5.fill(color);
        p5.rect(i * width, p5.windowHeight - 100, width, 100);
        p5.fill("black");
      } else {
        p5.fill("black");
        p5.rect(i * width, p5.windowHeight - 100, width, 100);
        p5.fill("white");
      }

      p5.textFont("Roboto");
      p5.textSize(32);
      p5.textStyle("BOLD");
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.text(_.upperCase(text), i * width, p5.windowHeight - 100, width, 100);
    }

    switch(step) {
      case 0:
        if (newStep) {
          newStep = false;
          displayBackground(bgTitle);
        }

        break;
      case 1:
        if (newStep) {
          newStep = false;

          clips["clip1"].play();
          displayBackground(bgGray);
        }

        displayVideo("clip1");


        if (clips["clip1"].time() >= clips["clip1"].duration()) {
          step++;
          newStep = true;
        }

        break;
      case 2:
        if (newStep) {
          newStep = false;

          clips["clip1"].pause();
          clips["clip2"].play();
          displayBackground(bgGray);
        }

        displayVideo("clip2");


        if (clips["clip2"].time() >= clips["clip2"].duration()) {
          step++;
          newStep = true;
        }

        break;
      case 3:
        if (newStep) {
          newStep = false;

          clips["clip2"].pause()
          isSelectingGroup = true;
        }

        displayBackground(bgBlack);
        displayTitle("SELECT A TARGET GROUP");

        length = groupOptions.length;
        width = p5.windowWidth / length;
        for (var i = 0; i < length; i++) {
          displayOption(groupOptions[i], i, width, i+1 === groupSelection)
        }

        break;
      case 4:
        if (newStep) {
          newStep = false;
          isSelectingGroup = false;

          clips[`clip3${_.upperFirst(groupOptions[groupSelection-1])}`].play();
          displayBackground(bgGray);
        }

        displayVideo(`clip3${_.upperFirst(groupOptions[groupSelection-1])}`);


        if (clips[`clip3${_.upperFirst(groupOptions[groupSelection-1])}`].time() >= clips[`clip3${_.upperFirst(groupOptions[groupSelection-1])}`].duration()) {
          step++;
          newStep = true;
        }

        break;
      case 5:
        if (newStep) {
          newStep = false;
          isSelectingLabel = true;

          clips[`clip3${_.upperFirst(groupOptions[groupSelection-1])}`].pause();
          displayBackground(bgBlack);
        }

        displayTitle("SELECT A LABEL");

        length = labelOptions.length;
        width = p5.windowWidth / length;
        for (var i = 0; i < length; i++) {
          displayOption(labelOptions[i], i, width, i+1 === labelSelection);
        }

        break;
      case 6:
        if (newStep) {
          newStep = false;
          isSelectingLabel = false;

          clips[`clip4${_.upperFirst(groupOptions[groupSelection-1])}`].play();
          displayBackground(bgGray);
        }

        displayVideo(`clip4${_.upperFirst(groupOptions[groupSelection-1])}`);


        if (clips[`clip4${_.upperFirst(groupOptions[groupSelection-1])}`].time() >= clips[`clip4${_.upperFirst(groupOptions[groupSelection-1])}`].duration()) {
          step++;
          newStep = true;
        }

        break;
      case 7:
        if (newStep) {
          newStep = false;
          isSelectingNarrative = true;

          clips[`clip4${_.upperFirst(groupOptions[groupSelection-1])}`].pause();
          displayBackground(bgBlack);
        }

        narratives = narrativeOptions[`${groupOptions[groupSelection-1]}.${labelOptions[labelSelection-1]}`];
        length = narratives.length;
        width = p5.windowWidth / length;
        for (var i = 0; i < length; i++) {
          let active = i+1 === narrativeSelection;
          if (active) {
            p5.fill(color);
          } else {
            p5.fill("black");
          }
          p5.rect(i * width, 0, width, p5.windowHeight);

          if (active) {
            p5.fill("black");
          } else {
            p5.fill("white");
          }
          p5.textFont("Roboto");
          p5.textSize(24);
          p5.textStyle("BOLD");
          p5.textAlign(p5.CENTER, p5.CENTER);
          p5.text(narratives[i], i * width + 20, 0, width - 40, p5.windowHeight);
        }

        break;
      case 8:
        // you're a natural... here are some notable works
        if (newStep) {
          newStep = false;
          isSelectingNarrative = false;

          clips["clip5"].play();
          displayBackground(bgGray);
        }

        displayVideo("clip5");


        if (clips["clip5"].time() >= clips["clip5"].duration()) {
          step++;
          newStep = true;
        }

        break;
      case 9:
        // grid
        if (newStep) {
          newStep = false;

          clips["clip5"].pause();
          clips["clipGrid"].play();
          displayBackground(bgBlack);
        }

        displayVideo("clipGrid");

        if (clips["clipGrid"].time() >= clips["clipGrid"].duration()) {
          step++;
          newStep = true;
        }

        break;
      case 10:
        if (newStep) {
          newStep = false;

          clips["clipGrid"].pause();
          clips["clipDone"].play();
          displayBackground(bgGray);
        }

        displayVideo("clipDone");

        if (clips["clipDone"].time() >= clips["clipDone"].duration()) {
          step++;
          newStep = true;
        }

        break;
      case 11:
        // fake news
        if (newStep) {
          newStep = false;

          key = `${groupOptions[groupSelection-1]}.${labelOptions[labelSelection-1]}`;

          clips["clipDone"].pause();
          fakeNewsVideo = p5.createVideo([fakeNewsVideos[key]]);
          fakeNewsVideo.hide();
          fakeNewsVideo.play();

          displayBackground(bgBlack);
        }

        displayFakeNews(key);


        if (fakeNewsVideo.time() >= fakeNewsVideo.duration() / 2) {
          step++;
          newStep = true;
        }

        break;
      case 12:
        // picture in grid
        if (newStep) {
          newStep = false;

          key = `${groupOptions[groupSelection-1]}.${labelOptions[labelSelection-1]}`;

          clips["clipGrid"].play();
          clips["clipGrid"].volume(0);
          displayBackground(bgGray);
        }

        displayVideo("clipGrid");
        displayFakeNewsSmall(key);


        if (fakeNewsVideo.time() >= fakeNewsVideo.duration()) {
          step++;
          newStep = true;
        }

        break;
      case 13:
        // closing statement
        if (newStep) {
          newStep = false;

          fakeNewsVideo.pause();
          clips["clip6"].play();

          displayBackground(bgGray);
        }

        displayVideo("clip6");


        if (clips["clip6"].time() >= clips["clip6"].duration()) {
          step++;
          newStep = true;
        }

        break;
      case 14:
        // closing statement
        if (newStep) {
          newStep = false;

          clips["clip6"].pause();

          displayBackground(bgTitle);
        }

        break;
    }

    if (DEBUG_FLAG) {
      debug("step: " + step + " group: " + groupSelection + " --- label: " + labelSelection);
    }
  }

  function groupMousePressed(event) {
    event.preventDefault();
    groupSelection = event.target.value;
  }

  function labelMousePressed(event) {
    event.preventDefault();
    labelSelection = event.target.value;
  }

  p5.mouseClicked = () => {
  }

  p5.keyPressed = () => {
    // SPACEBAR
    if (p5.keyCode === 32) {
      step++;
      newStep = true;
    }


    // LEFT_ARROW and RIGHT_ARROW only during selection screens
    if (isSelectingGroup) {
      if (p5.keyCode === p5.LEFT_ARROW) {
        groupSelection = groupSelection === 1 ? 3 : groupSelection - 1;
      }
      if (p5.keyCode === p5.RIGHT_ARROW) {
        groupSelection = groupSelection === 3 ? 1 : groupSelection + 1;
      }
    }

    if (isSelectingLabel) {
      if (p5.keyCode === p5.LEFT_ARROW) {
        labelSelection = labelSelection === 1 ? 3 : labelSelection - 1;
      }
      if (p5.keyCode === p5.RIGHT_ARROW) {
        labelSelection = labelSelection === 3 ? 1 : labelSelection + 1;
      }
    }

    if (isSelectingNarrative) {
      if (p5.keyCode === p5.LEFT_ARROW) {
        narrativeSelection = narrativeSelection === 1 ? 3 : narrativeSelection - 1;
      }
      if (p5.keyCode === p5.RIGHT_ARROW) {
        narrativeSelection = narrativeSelection === 3 ? 1 : narrativeSelection + 1;
      }
    }
  }

}

new p5(sketch);
