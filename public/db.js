const db;
//make connection to db
const request = indexedDB.open("budget", 1);


request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};
request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.online) {
    checkDb();
  }
};

request.onerror = function (event) {
  console.log(event.target.error);
};


function saveRecord(transaction){
    const transaction = db.transaction(['new_transaction'], readwite)
    const budget = transaction.objectStore('new_transaction');
    budget.add(transaction)
};

function checkDb() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            throw new Error(data);
          }
          // delete records if successful
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
          console.log("your transactions have been submitted");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

function deletePending() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.clear();
}


// listen for app coming back online
window.addEventListener("online", checkDb);