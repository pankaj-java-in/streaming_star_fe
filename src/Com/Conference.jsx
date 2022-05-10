import React, { useEffect } from "react";
import { WebRTCAdaptor } from "./js/webrtc_adaptor";
import { getUrlParameter } from "./js/fetch.stream.js";

const Conference = () => {
  var webRTCAdaptor;
  var token = getUrlParameter("token");
  var publishStreamId = getUrlParameter("streamId");
  var streamName = getUrlParameter("streamName");
  var playOnly = getUrlParameter("playOnly");
  var roomName = getUrlParameter("roomName");
  var subscriberId = getUrlParameter("subscriberId");
  var subscriberCode = getUrlParameter("subscriberCode");
  var isChatActive = false;

  if (roomName == null) {
    roomName = "room1";
  }

  if (streamName == null) {
    streamName = "Guest";
  }

  if (playOnly == null) {
    playOnly = false;
  }

  var roomOfStream = new Array();
  var streamIdList = new Array();
  var streamDetailsList = new Array();

  var isDataChannelOpen = false;
  var isMicMuted = false;
  var isCameraOff = false;
  var isChatActive = false;
  var roomTimerId = -1;


  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }

  function getStreamName(streamId) {
    var remoteStreamName = "Guest";

    streamDetailsList.forEach((item) => {
      if (item.streamId == streamId && item.streamName != null) {
        remoteStreamName = item.streamName;
      }
    });
    return remoteStreamName;
  }

  function joinRoom() {
    webRTCAdaptor.joinRoom(roomName, publishStreamId);
  }

  function leaveRoom() {
    webRTCAdaptor.leaveFromRoom(roomName);

    for (var node in document.getElementById("players").childNodes) {
      if (node.tagName == "DIV" && node.id != "localVideo") {
        document.getElementById("players").removeChild(node);
      }
    }
  }

  function publish(
    publishStreamId,
    token,
    subscriberId,
    subscriberCode,
    streamName
  ) {
    webRTCAdaptor.publish(
      publishStreamId,
      token,
      subscriberId,
      subscriberCode,
      streamName
    );
  }

  function streamInformation(obj) {
    webRTCAdaptor.play(obj.streamId, token, roomName);
  }

  function playVideo(obj) {
    var room = roomName;
    console.log(
      "new stream available with id: " + obj.streamId + "on the room:" + room
    );

    var index;
    if (obj.track.kind == "video") {
      index = obj.track.id.replace("ARDAMSv", "");
    } else if (obj.track.kind == "audio") {
      index = obj.track.id.replace("ARDAMSa", "");
    }

    if (index == room) {
      return;
    }

    var video = document.getElementById("remoteVideo" + index);
    var videoColumn = document.getElementById("streamId" + index);

    if (video == null) {
      createRemoteVideo(index);
      video = document.getElementById("remoteVideo" + index);
      video.srcObject = new MediaStream();
    }

    video.srcObject.addTrack(obj.track);

    obj.track.onended = (event) => {
      if (video.srcObject != null && video.srcObject.getTracks().length == 0) {
        removeRemoteVideo(index);
      }
    };
  }

  function createRemoteVideo(streamId) {
    generateStreamCol(streamId);

    if (
      streamIdList.length >= 1 &&
      document.getElementsByClassName("publisher-screen")[0] != null
    ) {
      document.getElementsByClassName("publisher-screen")[0].className =
        "me-small-screen";
      document.getElementsByClassName("persons")[0].className = "persons";
      document.getElementsByClassName("viewer-content")[0].className =
        "publisher-content chat-active";
    }

    if (streamIdList.length == 1) {
      document.getElementsByClassName("publisher-content")[0].className =
        "publisher-content chat-active one-user";
    }

    if (streamIdList.length == 2) {
      document.getElementsByClassName("publisher-content")[0].className =
        "publisher-content chat-active two-user";
    }

    if (streamIdList.length == 3) {
      document.getElementsByClassName("publisher-content")[0].className =
        "publisher-content chat-active there-user";
    }

    if (streamIdList.length == 4) {
      document.getElementsByClassName("publisher-content")[0].className =
        "publisher-content chat-active four-user";
    }

    if (streamIdList.length > 4) {
      document.getElementsByClassName("publisher-content")[0].className =
        "publisher-content chat-active multi-user";
    }

    if (isChatActive) {
      document
        .getElementsByClassName("publisher-content")[0]
        .classList.add("active");
    }
  }

  function generateStreamCol(streamId) {
    const div = document.createElement("div");
    div.className = "col";
    div.id = "streamId" + streamId;
    div.innerHTML =
      '<div className="person" style="height:100vh;width:100vw;background:black; display:flex; justify-content:center; align-items:center"><video id="remoteVideo' +
      streamId +
      '" className="screen" style="height:90vh"; width:90wv; position:absolute;"  autoPlay playsInline></video> </div>';
    document.getElementById("players").appendChild(div);
  }

  function removeRemoteVideo(streamId) {
    var video = document.getElementById("remoteVideo" + streamId);
    if (video != null) {
      var player = document.getElementById("streamId" + streamId);
      video.srcObject = null;
      document.getElementById("players").removeChild(player);
      var streamIdIndex = streamIdList.indexOf(streamId);
      //remove streamId from the streamIdList array
      streamIdList.splice(streamIdIndex, 1);

      if (streamIdList.length == 0) {
        document.getElementsByClassName("publisher-content")[0].className =
          "viewer-content chat-active";
        document.getElementsByClassName("me-small-screen")[0].className =
          "publisher-screen";
        document.getElementsByClassName("persons")[0].className =
          "persons d-none";
        if (isChatActive) {
          document
            .getElementsByClassName("viewer-content")[0]
            .classList.add("active");
        }
      }

      if (streamIdList.length == 1) {
        document.getElementsByClassName("publisher-content")[0].className =
          "publisher-content chat-active one-user";
      }

      if (streamIdList.length == 2) {
        document.getElementsByClassName("publisher-content")[0].className =
          "publisher-content chat-active two-user";
      }

      if (streamIdList.length == 3) {
        document.getElementsByClassName("publisher-content")[0].className =
          "publisher-content chat-active three-user";
      }

      if (streamIdList.length == 4) {
        document.getElementsByClassName("publisher-content")[0].className =
          "publisher-content chat-active four-user";
      }

      if (
        document.getElementsByClassName("publisher-content")[0] != null &&
        isChatActive
      ) {
        document
          .getElementsByClassName("publisher-content")[0]
          .classList.add("active");
      }
    }
  }

  var pc_config = {
    iceServers: [
      {
        urls: "stun:stun1.l.google.com:19302",
      },
    ],
  };

  var sdpConstraints = {
    OfferToReceiveAudio: false,
    OfferToReceiveVideo: false,
  };

  var mediaConstraints = {
    video: {
      width: { max: 640 },
      height: { max: 480 },
    },
    audio: true,
  };

  function checkTrackStatus(streamIdList) {
    streamIdList.forEach(function (item) {
      var video = document.getElementById("remoteVideo" + item);
      if (video != null && !video.srcObject.active) {
        removeRemoteVideo(item);
        playVideo(item);
      }
    });
  }

  var appName = window.location.pathname.substring(
    0,
    window.location.pathname.lastIndexOf("/") + 1
  );
  var path =
    window.location.hostname +
    ":" +
    window.location.port +
    appName +
    "websocket";
  var websocketURL = "ws://" + "13.41.68.244:5080/Recording/websocket";

  if (window.location.protocol.startsWith("https")) {
    websocketURL = "wss://" + path;
  }

  useEffect(()=>{
    webrtcLoader();
  },[])

  const webrtcLoader = ()=>{
    webRTCAdaptor = new WebRTCAdaptor({
      websocket_url: websocketURL,
      mediaConstraints: mediaConstraints,
      peerconnection_config: pc_config,
      sdp_constraints: sdpConstraints,
      localVideoId: "localVideo",
      isPlayMode: playOnly,
      debug: true,
      callback: (info, obj) => {
        if (info == "initialized") {
          console.log("initialized");
          webRTCAdaptor.joinRoom(roomName, publishStreamId);
        } else if (info == "joinedTheRoom") {
          var room = obj.ATTR_ROOM_NAME;
          roomOfStream[obj.streamId] = room;
          console.log("joined the room: " + roomOfStream[obj.streamId]);
          console.log(obj);
  
          publishStreamId = obj.streamId;
  
          if (playOnly) {
            isCameraOff = true;
            //handle CameraButtons();
          } else {
            publish(
              obj.streamId,
              token,
              subscriberId,
              subscriberCode,
              streamName
            );
          }
  
          if (obj.streams != null) {
            obj.streams.forEach(function (item) {
              console.log("Stream joined with ID: " + item);
              webRTCAdaptor.play(item, token, roomName);
            });
            streamIdList = obj.streams;
            streamDetailsList = obj.streamList;
          }
          roomTimerId = setInterval(() => {
            webRTCAdaptor.getRoomInfo(roomName, publishStreamId);
          }, 5000);
        } else if (info == "newStreamAvailable") {
          playVideo(obj);
        } else if (info == "publish_started") {
          //stream is being published
          console.debug(
            "publish started to room: " + roomOfStream[obj.streamId]
          );
        } else if (info == "publish_finished") {
          //stream is being finished
          console.debug("publish finished");
        } else if (info == "screen_share_stopped") {
          console.log("screen share stopped");
        } else if (info == "browser_screen_share_supported") {
          // screen_share_button.disabled = false;
          console.log("browser screen share supported");
        } else if (info == "leavedFromRoom") {
          var room = obj.ATTR_ROOM_NAME;
          console.debug("leaved from the room:" + room);
          if (roomTimerId != null) {
            clearInterval(roomTimerId);
          }
  
          if (streamIdList != null) {
            streamIdList.forEach(function (item) {
              removeRemoteVideo(item);
            });
          }
          // we need to reset streams list
          streamIdList = new Array();
          streamDetailsList = new Array();
        } else if (info == "closed") {
          if (typeof obj != "undefined") {
            console.log("Connecton closed: " + JSON.stringify(obj));
          }
        } else if (info == "play_finished") {
          console.log("play_finished");
          removeRemoteVideo(obj.streamId);
        } else if (info == "streamInformation") {
          streamInformation(obj);
        } else if (info == "roomInformation") {
          //Checks if any new stream has added, if yes, plays.
          for (let str of obj.streams) {
            if (!streamIdList.includes(str)) {
              webRTCAdaptor.play(str, token, roomName);
            }
          }
          // Checks if any stream has been removed, if yes, removes the view and stops webrtc connection.
          for (let str of streamIdList) {
            if (!obj.streams.includes(str)) {
              removeRemoteVideo(str);
            }
          }
          //Lastly updates the current streamlist with the fetched one.
          streamIdList = obj.streams;
          streamDetailsList = obj.streamList;
  
          //Check video tracks active/inactive status
          checkTrackStatus(streamIdList);
        } else if (info == "data_channel_opened") {
          console.log("Data Channel open for stream id", obj);
          isDataChannelOpen = true;
        } else if (info == "data_channel_closed") {
          console.log("Data Channel closed for stream id", obj);
          if (streamIdList.length == 0) {
            isDataChannelOpen = false;
          }
        } else if (info == "data_received") {
          try {
            //  handleNotificationEvent(obj);
          } catch (e) {
            var remoteStreamName = getStreamName(obj.streamId);
            document
              .getElementById("chat")
              .append(
                '<li className="you"><div className="entete"><h3>' +
                  formatAMPM(new Date()) +
                  ", Today &nbsp</h3><h2> " +
                  remoteStreamName +
                  '&nbsp</h2><span className="status you-dot"></span></div><div className="triangle"></div><div className="message">' +
                  obj.data +
                  "</div></li>"
              );
          }
        }
      },
      callbackError: function (error, message) {
        //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
  
        if (error.indexOf("publishTimeoutError") != -1 && roomTimerId != null) {
          clearInterval(roomTimerId);
        }
  
        console.log("error callback: " + JSON.stringify(error));
        var errorMessage = JSON.stringify(error);
        if (typeof message != "undefined") {
          errorMessage = message;
        }
        var errorMessage = JSON.stringify(error);
        if (error.indexOf("NotFoundError") != -1) {
          errorMessage =
            "Camera or Mic are not found or not allowed in your device.";
        } else if (
          error.indexOf("NotReadableError") != -1 ||
          error.indexOf("TrackStartError") != -1
        ) {
          errorMessage =
            "Camera or Mic is being used by some other process that does not not allow these devices to be read.";
        } else if (
          error.indexOf("OverconstrainedError") != -1 ||
          error.indexOf("ConstraintNotSatisfiedError") != -1
        ) {
          errorMessage =
            "There is no device found that fits your video and audio constraints. You may change video and audio constraints.";
        } else if (
          error.indexOf("NotAllowedError") != -1 ||
          error.indexOf("PermissionDeniedError") != -1
        ) {
          errorMessage = "You are not allowed to access camera and mic.";
          // screen_share_button.checked = false;
        } else if (error.indexOf("TypeError") != -1) {
          errorMessage = "Video/Audio is required.";
        } else if (error.indexOf("UnsecureContext") != -1) {
          errorMessage =
            "Fatal Error: Browser cannot access camera and mic because of unsecure context. Please install SSL and access via https";
        } else if (error.indexOf("WebSocketNotSupported") != -1) {
          errorMessage = "Fatal Error: WebSocket not supported in this browser";
        } else if (error.indexOf("no_stream_exist") != -1) {
          //TODO: removeRemoteVideo(error.streamId);
        } else if (error.indexOf("data_channel_error") != -1) {
          errorMessage = "There was a error during data channel communication";
        } else if (error.indexOf("ScreenSharePermissionDenied") != -1) {
          errorMessage = "You are not allowed to access screen share";
          //screen_share_button.checked = false;
        }
  
        alert(errorMessage);
      },
    });
  }

  function getWindowLocation() {
    document.getElementById("locationHref").value = window.location.href;
  }

  function copyWindowLocation() {
    var copyText = document.getElementById("locationHref");

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    document.execCommand("copy");
  }

  window.getWindowLocation = getWindowLocation;
  window.copyWindowLocation = copyWindowLocation;
  return (
    <>
      <div className="container">
        <div className="viewer-content chat-active">
          <div className="publisher-screen d-none" style={{display:"none"}}>
            <video
              id="localVideo"
              className="screen d-none"
              autoPlay
              muted
              playsInline
            ></video>
          </div>

          <div className="persons  d-none">
            <div className="row" id="players" ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Conference;
