// Copyright (c) 2022 Braden Nicholson


import axios from "axios";
import {getSession} from "@/session";

let headers = {
    mode: 'cors',
    cache: 'no-cache',
    headers: {
        Authorization: "Bearer " + getSession().token
    }
}

function host(): string {
    let ctrl = 'https://app.netwatcher.io'
    if (ctrl) {
        return ctrl
    } else {
        return ""
    }
}


export default {
    async post(url: string, data?: {} | undefined): Promise<any> {
        const response = await axios.post(`${host()}${url}`, data, headers)
        let resp = response.data
        if (response.status !== 200) {

        }
        return response
    },
    async get(url: string, data?: {} | undefined): Promise<any> {
        return axios.get(`${host()}${url}`, headers)
    }
}

