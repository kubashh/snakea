const adress = "https://psychic-doodle-jj5vwjj67qqrfq9x6-8888.app.github.dev";

async function sendRequest() {
  try {
    const response = await fetch(adress, {
      method: "POST",
      body: JSON.stringify({ data: "wysylam" }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if(!response.ok) {
      throw new Error(`Błąd zapytania: ${response.status} ${response.statusText}`);
    }
  } catch(error) {
    console.error("Błąd podczas wykonywania żądania:", error);
  }
}

async function getRequest() {
  try {
    const response = await fetch(adress);
    const data = await response.json();
    console.log("Otrzymane dane:", data);
  } catch(error) {
    console.error("Błąd pobierania danych:", error);
  }
}
