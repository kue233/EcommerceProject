function logout() {
    document.cookie = "JWT" + "=" + "" + ";" + "currUser" + "=" + "";
    document.cookie = "currUser" + "=" + "";
    window.location.href = "./homePage.html"
    alert("log out successfully!");
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
