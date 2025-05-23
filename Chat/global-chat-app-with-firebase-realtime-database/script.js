(function () {
  firebase.initializeApp({
    apiKey: "AIzaSyAnXOIbDMrzoFWDldHEAO4uCgYzfrgphT4",
    authDomain: "seven-squares-studios-staging.firebaseapp.com",
    databaseURL: "https://seven-squares-studios-staging.firebaseio.com",
    projectId: "seven-squares-studios-staging",
    storageBucket: "seven-squares-studios-staging.appspot.com",
    messagingSenderId: "275163125284"
  });

  const firestore = firebase.firestore();
  const chatsRef = firestore.collection("chat");

  let startAt = null;

  const scrollTrigger = document.getElementById("trigger");

  let options = {
    root: messages,
    rootMargin: "0px",
    threshold: 1.0
  };

  let page = 2;

  let observer = new IntersectionObserver((entries) => {
    
    const entry = entries[0]
    
    if (entry.intersectionRatio && entry.isIntersecting) {
      console.log("getting new page:", page++);

      let queryRef = chatsRef.orderBy("time", "desc").limit(10);

      if (startAt) {
        queryRef = queryRef.startAfter(startAt);
      }

      queryRef.get().then((snap) => {
        const messages = snap.docs.map((doc) => ({...doc.data(), id: doc.id}));

        console.log("new messages count:", messages.length);

        Array.from(messages)
          .reverse()
          .forEach((message, ix) => {
            addMessage(message, !startAt, ix == 0);
          });

        startAt = snap.docs.at(-1);
      });
    }
  }, options);

  chatsRef
    .orderBy("time", "desc")
    .limit(10)
    .get()
    .then((snap) => {
      const messages = snap.docs.map((doc) => ({...doc.data(), id: doc.id}));

        console.log("new messages count:", messages.length);

        Array.from(messages)
          .reverse()
          .forEach((message, ix) => {
            addMessage(message, !startAt, ix === messages.length - 1);
          });

        startAt = snap.docs.at(-1);

      observer.observe(scrollTrigger);
    });

  // Now set a listener for when we have a new message
  chatsRef
    .orderBy("time")
    .startAfter(Date.now())
    .limit(1000)
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const message = change.doc.data();
          // console.log("New message: ", message);
          addMessage({...message, id: change.doc.id}, false, true);
        }
      });
    });

  user.value = localStorage.getItem("username");
  send.onclick = function () {
    if (user.value && text.value) {
      localStorage.setItem("username", user.value);
      sendMessage(user.value, text.value, chatsRef);
    } else {
      alert(
        "You need to have a username (input box on top of app) and text in the message box"
      );
    }
  };
  text.onkeydown = function (event) {
    // console.log(event.keyCode);
    if (event.keyCode === 13) {
      send.click();
    }
  };
  user.focus();
})();

function addMessage(message, append = true, showEle = false) {
  var div = document.createElement("div");
  div.id = message.id
  div.classList.add('message')
  var nameCont = document.createElement("div");
  nameCont.classList.add("username");
  var textCont = document.createElement("div");
  textCont.classList.add("text");
  var dateCont = document.createElement("div");
  dateCont.classList.add("text");
  dateCont.classList.add("date");
  div.appendChild(nameCont);
  div.appendChild(textCont);
  div.appendChild(dateCont);
  nameCont.innerText = message.username;
  textCont.innerText = message.text;
  dateCont.innerText = new Intl.DateTimeFormat("default", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(message.time));
  if (append) {
    messages.append(div)
  } else {
    trigger.after(div);
  }
  showEle && div.scrollIntoView();
}

function sendMessage(username, message, db) {
  text.disabled = true;
  send.disabled = true;

  var message = db
    .add({
      username,
      text: message,
      time: Date.now()
    })
    .then(() => {
      // console.log("added doc");
      text.disabled = false;
      send.disabled = false;
      text.value = "";
    });

  return message;
}