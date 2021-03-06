import React, {
  useContext,
  useState,
  useEffect,
  useReducer,
  useRef
} from "react";
import PropTypes from "prop-types";
import { fetchPopularRepos } from "./utils/api";
import {
  FaUser,
  FaStar,
  FaCodeBranch,
  FaExclamationTriangle
} from "react-icons/fa";
import Card from "./card";
import Tooltip from "./tooltip";
import ThemeContext from "../context/theme";

function LanguagesNav({ selected, onUpdateLanguage }) {
  const languages = ["All", "JavaScript", "Python", "C", "Java", "CSS"];

  const theme = useContext(ThemeContext);
  return (
    <ul className="flex-center">
      {languages.map(l => (
        <li key={l}>
          <button
            className={`btn-clear nav-link text-${theme}`}
            style={l === selected ? { color: "#EB965A" } : {}}
            onClick={() => onUpdateLanguage(l)}
          >
            {l}
          </button>
        </li>
      ))}
    </ul>
  );
}

LanguagesNav.propTypes = {
  selected: PropTypes.string.isRequired,
  onUpdateLanguage: PropTypes.func.isRequired
};

function ReposGrid({ repos }) {
  return (
    <ul className="grid space-around">
      {repos.map((repo, index) => {
        const {
          name,
          owner,
          html_url,
          stargazers_count,
          forks,
          open_issues
        } = repo;
        const { login, avatar_url } = owner;
        const redirect = () => {
          window.open(`https://github.com/${login}`, "_blank");
        };

        return (
          <li key={html_url}>
            <Card
              header={`${index + 1}`}
              avatar={avatar_url}
              href={html_url}
              name={login}
            >
              <ul className="card-list">
                <li>
                  <Tooltip text="Github username">
                    <FaUser color="rgb(255,191,116" size={22} />
                    <span onClick={redirect}>{login}</span>
                  </Tooltip>
                </li>
                <li className="default-cursor">
                  <FaStar color="rgb(255,215,0)" size={22} />
                  {stargazers_count.toLocaleString()} stars
                </li>
                <li className="default-cursor">
                  <FaCodeBranch color="rgb(129,195,245)" size={22} />
                  {forks.toLocaleString()} forks
                </li>
                <li className="default-cursor">
                  <FaExclamationTriangle color="rgb(241,138,147)" size={22} />
                  {open_issues.toLocaleString()} open issues
                </li>
              </ul>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

function popularReducer(state, action) {
  if (action.type === "success") {
    return {
      ...state,
      [action.selectedLanguage]: action.repos,
      error: null
    };
  } else if (action.type === "error") {
    return { ...state, error: action.error.message };
  } else {
    throw new Error("That action type isn't supported.");
  }
}

export default function Popular() {
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  const [state, dispatch] = useReducer(popularReducer, { error: null });

  const fetchedLanguages = useRef([]);

  useEffect(() => {
    if (fetchedLanguages.current.includes(selectedLanguage) === false) {
      fetchedLanguages.current.push(selectedLanguage);

      fetchPopularRepos(selectedLanguage)
        .then(repos => dispatch({ type: "success", selectedLanguage, repos }))
        .catch(err => dispatch({ type: "error", error }));
    }
  }, [fetchedLanguages, selectedLanguage]);

  const isLoading = () => !state[selectedLanguage] && state.error === null;

  return (
    <React.Fragment>
      <LanguagesNav
        selected={selectedLanguage}
        onUpdateLanguage={language => setSelectedLanguage(language)}
      />

      {isLoading() && <div className="loader"></div>}

      {state.error && <p className="center-text error">{state.error}</p>}

      {state[selectedLanguage] && <ReposGrid repos={state[selectedLanguage]} />}
    </React.Fragment>
  );
}
