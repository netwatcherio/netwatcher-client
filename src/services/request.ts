// Copyright (c) 2022 Braden Nicholson


import axios from "axios";

const token = localStorage.getItem("token")

let headers = {
    headers: {
        Authorization: "Bearer " + token
    }
}

function host(): string {
    let ctrl = localStorage.getItem("controller")
    if (ctrl) {
        return ctrl
    } else {
        return ""
    }
}


export default {
    async post(url: string, data?: {} | undefined): Promise<void> {
        const response = await axios.post(`https://${host()}${url}`, data, headers)
        let resp = response.data
        if (response.status !== 200) {

        }
    }
}

