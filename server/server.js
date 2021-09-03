const { SSL_OP_NO_QUERY_MTU } = require("constants");

const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

var listOfBookings = [
  "LSF23",
  "COUA2",
  "SLDF2",
  "IWYW6",
  "S2F02",
  "F2E42",
  "SLF03",
  "IRUCB2",
  "WUJ20",
  "QIYO1",
  "OILK9",
  "PIOU1",
  "OLKM2",
  "POLK9",
  "FVB9V",
  "VDW23",
  "OQUD2",
  "OWR19",
  "QPEI1",
  "WI2BH",
  "SSLO2",
];
let randomNumber = parseInt(Math.random() * listOfBookings.length);
var randomBooking = "";
io.on("connection", (socket) => {
  randomBooking = listOfBookings[randomNumber];
  let index = listOfBookings.indexOf(randomBooking);
  console.log(listOfBookings.length);
  console.log("connection made successfully");
  var homeName = "";
  socket.on("message", (payload) => {
    console.log("Message received on server: ", payload);
    if (payload.stage == "1") {
      var sendOutBookingObj = {};
      if (payload.isGetBooking) {
        listOfBookings.splice(index, 1);
        io.emit("message", randomBooking);
      } else {
        if (payload.connectionStatus == "waiting for pair") {
          listOfBookings.push({
            bookingCode: payload.bookingCode,
            playerName: payload.playerName,
            connectionStatus: payload.connectionStatus,
            concatQuestionNumber: payload.concatQuestionNumber,
          });
          console.log("Got into if");
        } else if (payload.connectionStatus == "want to pair") {
          var tempList = [];
          console.log("Got into else");
          listOfBookings.forEach((element) => {
            if (payload.bookingCode == element.bookingCode) {
              console.log("booking match found");

              if (element.connectionStatus == "waiting for pair") {
                console.log("booking is about to pair");
                sendOutBookingObj = {
                  bookingCode: element.bookingCode,
                  connectionStatus: "paired",
                  homeName: element.playerName,
                  awayName: payload.playerName,
                  concatQuestionNumber: element.concatQuestionNumber,
                };
                tempList.push(sendOutBookingObj);
              } else {
                console.log("Sorry, another user already joined the game");
                sendOutBookingObj = {
                  connectionStatus: "unable to pair",
                  details: "another user joined the game",
                };
              }
            } else {
              tempList.push(element);
            }
          });
          listOfBookings = tempList;
          if (sendOutBookingObj == {}) {
            sendOutBookingObj = {
              connectionStatus: "unable to pair",
              details: "booking code match not found",
            };
          }
          io.emit("message", sendOutBookingObj);
        }
      }
    } else if (payload.stage == "2") {
      console.log("Message distributed");
      if (payload.p2SelectedOption == payload.correctAnswer) {
        payload.isCorrect = true;
      }
      io.emit("message", payload);
    }
    console.log(listOfBookings.length);
  });
  socket.on("disconnect", () => {
    console.log("Socket is disconnected and element is returned");
    if (index < 0) {
      listOfBookings.push(randomBooking);
      console.log(listOfBookings.length);
    }
    console.log(listOfBookings.length);
  });
});

server.listen(7000, () => {
  console.log("I am listening at port 7000");
});
