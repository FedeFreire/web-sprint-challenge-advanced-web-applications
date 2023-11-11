import React, { useEffect, useState } from "react";
import PT from "prop-types";

const initialFormValues = { title: "", text: "", topic: "" };

export default function ArticleForm({
  postArticle,
  updateArticle,
  setCurrentArticleId,
  currentArticle,
}) {
  const [values, setValues] = useState(initialFormValues);

  useEffect(() => {
    if (currentArticle) {
      setValues({
        title: currentArticle.title,
        text: currentArticle.text,
        topic: currentArticle.topic,
      });
    } else {
      setValues(initialFormValues);
    }
  }, [currentArticle]);

  const onChange = (evt) => {
    const { id, value } = evt.target;
    setValues({ ...values, [id]: value });
  };

  const onSubmit = async (evt) => {
    evt.preventDefault();
    console.log("Submitting form with values:", values);
    if (currentArticle) {
      await updateArticle({
        article_id: currentArticle.article_id,
        title: values.title,
        text: values.text,
        topic: values.topic,
      });
    } else {
      await postArticle(values);
    }
    setValues(initialFormValues);
    setCurrentArticleId(null);
  };

  const isDisabled = () => !values.title || !values.text || !values.topic;

  const cancelEdit = () => {
    setCurrentArticleId(null);
    setValues(initialFormValues);
  };

  return (
    <form id="form" onSubmit={onSubmit}>
      <h2>{currentArticle ? "Edit Article" : "Create Article"}</h2>
      <input
        type="text"
        maxLength={50}
        onChange={onChange}
        value={values.title}
        placeholder="Enter title"
        id="title"
      />
      <textarea
        maxLength={200}
        onChange={onChange}
        value={values.text}
        placeholder="Enter text"
        id="text"
      />
      <select onChange={onChange} id="topic" value={values.topic}>
        <option value="">-- Select topic --</option>
        <option value="JavaScript">JavaScript</option>
        <option value="React">React</option>
        <option value="Node">Node</option>
      </select>
      <div className="button-group">
        <button disabled={isDisabled()} id="submitArticle">
          Submit
        </button>
        {currentArticle && (
          <button type="button" onClick={cancelEdit}>
            Cancel edit
          </button>
        )}
      </div>
    </form>
  );
}

ArticleForm.propTypes = {
  postArticle: PT.func.isRequired,
  updateArticle: PT.func.isRequired,
  setCurrentArticleId: PT.func.isRequired,
  currentArticle: PT.shape({
    article_id: PT.number.isRequired,
    title: PT.string.isRequired,
    text: PT.string.isRequired,
    topic: PT.string.isRequired,
  }), // can be null or undefined, indicating "create" mode
};
