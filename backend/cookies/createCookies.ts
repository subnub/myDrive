import {Response } from "express";
import env from "../enviroment/env";

const maxAgeAccess =  60 * 1000 * 20;
//const maxAgeAccess =  1000;
const maxAgeRefresh = 60 * 1000 * 60 * 24 * 30;
//const maxAgeRefresh = 1000;
const maxAgeStreamVideo = 60 * 1000 * 60 * 24;

const secureCookies = env.secureCookies ? env.secureCookies === "true" ? true : false : false;

export const createLoginCookie = (res: Response, accessToken: string, refreshToken: string) => {

    res.cookie("access-token",accessToken, {
        httpOnly: true,
        maxAge: maxAgeAccess,
        sameSite: "strict",
        secure: secureCookies
    })

    res.cookie("refresh-token",refreshToken, {
        httpOnly: true,
        maxAge: maxAgeRefresh,
        sameSite: "strict",
        secure: secureCookies
    })
}

export const createLogoutCookie = (res: Response) => {

    res.cookie("access-token", {}, {
        httpOnly: true,
        maxAge: 0,
        sameSite: "strict",
        secure: secureCookies
    })

    res.cookie("refresh-token", {}, {
        httpOnly: true,
        maxAge: 0,
        sameSite: "strict",
        secure: secureCookies
    })
}

export const createStreamVideoCookie = (res: Response, streamVideoAccessToken: string) => {

    res.cookie("video-access-token", streamVideoAccessToken, {
        httpOnly: true,
        maxAge: maxAgeStreamVideo,
        sameSite: "strict",
        secure: secureCookies
    })
}

export const removeStreamVideoCookie = (res: Response) => {

    res.cookie("video-access-token", {}, {
        httpOnly: true,
        maxAge: 0,
        sameSite: "strict",
        secure: secureCookies
    })
}