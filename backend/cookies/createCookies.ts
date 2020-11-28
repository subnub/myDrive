import {Response } from "express";

const maxAgeAccess =  60 * 1000 * 20;
const maxAgeRefresh = 60 * 1000 * 60 * 24 * 30;
const maxAgeStreamVideo = 60 * 1000 * 60 * 24;

export const createLoginCookie = (res: Response, accessToken: string, refreshToken: string) => {

    res.cookie("access-token",accessToken, {
        httpOnly: true,
        maxAge: maxAgeAccess,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    })

    res.cookie("refresh-token",refreshToken, {
        httpOnly: true,
        maxAge: maxAgeRefresh,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    })
}

export const createLogoutCookie = (res: Response) => {

    res.cookie("access-token", {}, {
        httpOnly: true,
        maxAge: 0,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    })

    res.cookie("refresh-token", {}, {
        httpOnly: true,
        maxAge: 0,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    })
}

export const createStreamVideoCookie = (res: Response, streamVideoAccessToken: string) => {

    res.cookie("video-access-token", streamVideoAccessToken, {
        httpOnly: true,
        maxAge: maxAgeStreamVideo,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    })
}

export const removeStreamVideoCookie = (res: Response) => {

    res.cookie("video-access-token", {}, {
        httpOnly: true,
        maxAge: 0,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    })
}