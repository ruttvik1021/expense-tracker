"use client";
import axios, { AxiosHeaders } from "axios";
import Cookies from "js-cookie";

const getHeaders = (auth: boolean) => {
  const headers = new AxiosHeaders();
  if (auth) {
    const token = Cookies.get("token");
    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return headers;
};

let controller: AbortController | null = null;

const createController = () => {
  if (controller) {
    controller.abort();
  }
  controller = new AbortController();
  return controller.signal;
};

const axiosInstance = axios.create({
  baseURL: "/api",
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (axios.isCancel(error)) {
        console.log("Request canceled", error.message);
        return Promise.reject({ isCanceled: true, ...error });
      }

      const { status } = error.response;
      if (status === 401 || status === 403) {
        // window.location.href = "/login"; // Redirect to login page
      }
    }
    return Promise.reject(error.response.data);
  }
);

const postAjax = async (
  url: string,
  data: Record<string, unknown>,
  auth: boolean
) => {
  return await axiosInstance.post(url, data, {
    headers: getHeaders(auth),
    signal: createController(),
  });
};

const putAjax = (url: string, data: Record<string, unknown>, auth: boolean) => {
  return axiosInstance.put(url, data, {
    headers: getHeaders(auth),
    signal: createController(),
  });
};

const deleteAjax = (url: string, auth: boolean) => {
  return axiosInstance.delete(url, {
    headers: getHeaders(auth),
    signal: createController(),
  });
};

const getAjax = (url: string, auth: boolean) => {
  return axiosInstance.get(url, {
    headers: getHeaders(auth),
    signal: createController(),
  });
};

export const AjaxUtils = {
  getAjax,
  deleteAjax,
  putAjax,
  postAjax,
};
