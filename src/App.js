import React, { useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import * as fp from 'fingerpose'
import "./App.css";
import thumbs_up from './thumbs_up.png'
import thumbs_down from './thumbs_down.png'
import victory from './victory.png'
import { drawHand } from "./utilities";


const imgStyle = {
  position: "absolute",
  marginLeft: "auto",
  marginRight: "auto",
  left: 400,
  bottom: 500,
  right: 0,
  textAlign: "center",
  height: 100,
}

const signs = { thumbs_up: thumbs_up, victory: victory, thumbs_down : thumbs_down };


function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null)
  
  const [emoji, setEmoji] = useState(null);

  const runHandpose = async () => {
    const net = await handpose.load();
    // console.log("handpose model loaded!");
    //Loop and detect Hands
    setInterval(()=>{
      detect(net);
    }, 100)
  };

  //finger 

  const detect = async (net) => {
    //check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      //get video porperties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      //set video height and width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      //set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      //make detection
      const hand = await net.estimateHands(video);
      // console.log(hand);

      //New gesture :
      const thumbsDownGesture = new fp.GestureDescription('thumbs_down');
      thumbsDownGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl);
      thumbsDownGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalDown, 1.0);

      thumbsDownGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalDownLeft, 0.9);
      thumbsDownGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.DiagonalDownRight, 0.9);

      if (hand.length>0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
          thumbsDownGesture
         


        ])
        const gesture = await GE.estimate(hand[0].landmarks,8);
        console.log(gesture);
        if (gesture.gestures!==undefined && gesture.gestures.length>0) {
          // alert(signs[gesture.gestures[0].name])
          setEmoji(signs[gesture.gestures[0].name]);

        }
      }

      //draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  runHandpose();

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            margin: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            margin: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
        {
          emoji!==null ? <img src={emoji} style={{imgStyle}}/> : "" 
        }

        
      </header>
    </div>
  );
}

export default App;
