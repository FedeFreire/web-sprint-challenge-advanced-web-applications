import React, { useState, useEffect } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import Articles from "./Articles";
import LoginForm from "./LoginForm";
import Message from "./Message";
import ArticleForm from "./ArticleForm";
import Spinner from "./Spinner";
import axiosWithAuth from "../axios";

export default function App() {
  const [message, setMessage] = useState("");
  const [articles, setArticles] = useState([]);
  const [currentArticleId, setCurrentArticleId] = useState(null);
  const [spinnerOn, setSpinnerOn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    console.log("Message updated to:", message);
  }, [message]);

  const redirectToLogin = () => {
    setMessage("");
    navigate("/");
  };

  const redirectToArticles = () => {
    //setMessage("");
    navigate("/articles");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setArticles([]);
    setMessage("Goodbye!");

    setTimeout(() => {
      redirectToLogin();
    }, 3000);
  };

  const login = async ({ username, password }) => {
    setMessage("");
    setSpinnerOn(true);
    try {
      const response = await axiosWithAuth().post("/login", {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      redirectToArticles();
    } catch (error) {
      console.error(
        "Login failed:",
        error.response ? error.response.data : error.message
      );
      setMessage("Login failed. Please try again.");
    } finally {
      setSpinnerOn(false);
    }
  };

  const getArticles = async () => {
    setMessage("");
    setSpinnerOn(true);
    try {
      const response = await axiosWithAuth().get("/articles");
      console.log(response.data);
      setArticles(response.data.articles || []);
      setMessage(response.data.message || "Articles fetched successfully.");
    } catch (error) {
      console.error("Error fetching articles:", error);
      setMessage(
        error.response && error.response.data
          ? error.response.data.message
          : "Error occurred"
      );
      if (error.response && error.response.status === 401) {
        redirectToLogin();
      }
    } finally {
      setSpinnerOn(false);
    }
  };

  const postArticle = async (article) => {
    setSpinnerOn(true);
    setMessage("");

    try {
      const response = await axiosWithAuth().post("/articles", article);
      setArticles((prevArticles) => [...prevArticles, response.data.article]);

      setMessage(response.data.message || "Article posted successfully.");

      setTimeout(() => {
        redirectToArticles();
      }, 3000);
    } catch (error) {
      console.error("Error posting article:", error);
      setMessage(
        error.response?.data?.message ||
          "Failed to post article. Please try again."
      );
    } finally {
      setSpinnerOn(false);
    }
  };

  const updateArticle = async ({ article_id, title, text, topic }) => {
    setMessage("");
    setSpinnerOn(true);
    try {
      const response = await axiosWithAuth().put(`/articles/${article_id}`, {
        title: title.trim(),
        text: text.trim(),
        topic,
      });

      if (response.data.articles) {
        setArticles(response.data.articles);
      } else {
        setArticles((prevArticles) =>
          prevArticles.map((art) =>
            art.article_id === article_id ? { ...art, title, text, topic } : art
          )
        );
      }

      setMessage(response.data.message || "Article updated successfully.");
      setCurrentArticleId(null);
    } catch (error) {
      console.error("Error updating article:", error);
      setMessage(
        error.response?.data?.message ||
          "Failed to update article. Please try again."
      );
    } finally {
      setSpinnerOn(false);
    }
  };

  const deleteArticle = async (article_id) => {
    setMessage("");
    setSpinnerOn(true);
    try {
      const response = await axiosWithAuth().delete(`/articles/${article_id}`);

      setArticles(articles.filter((art) => art.article_id !== article_id));
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error deleting article:", error);
      setMessage("Failed to delete article. Please try again.");
    } finally {
      setSpinnerOn(false);
    }
  };

  return (
    <>
      <Spinner on={spinnerOn} />
      <Message message={message} />
      <button id="logout" onClick={logout}>
        Logout from app
      </button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}>
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">
            Login
          </NavLink>
          <NavLink id="articlesScreen" to="/articles">
            Articles
          </NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route
            path="/articles"
            element={
              <>
                <ArticleForm
                  postArticle={postArticle}
                  updateArticle={updateArticle}
                  setCurrentArticleId={setCurrentArticleId}
                  currentArticleId={currentArticleId}
                  currentArticle={articles.find(
                    (art) => art.article_id === currentArticleId
                  )}
                />
                <Articles
                  setCurrentArticleId={setCurrentArticleId}
                  getArticles={getArticles}
                  articles={articles}
                  deleteArticle={deleteArticle}
                  updateArticle={updateArticle}
                />
              </>
            }
          />
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </>
  );
}
