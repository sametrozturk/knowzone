import { React, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useLocation } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Post from './Post';
import { GRAY1, GRAY3 } from '../constants/colors';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    color: GRAY1,
  },
  gridContainer: {
    border: `1px solid ${GRAY3}`,
    borderRadius: 4,
  },
  container: {
    padding: theme.spacing(2),
  },
}));

const SAMPLE_IMAGE_URL = 'https://www.cgi.com/sites/default/files/styles/hero_banner/public/space_astronaut.jpg?itok=k2oFRHrr';

const SearchResults = () => {
  const classes = useStyles();
  const location = useLocation();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const route = 'search/filter';
    const url = `${process.env.REACT_APP_KNOWZONE_BE_URI}/${route}`;

    fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(location.state),
    })
      .then((response) => response.json())
      .then((data) => setPosts(data))
      .catch((error) => console.log(error));
  }, [location]);

  return (
    <div className={classes.root}>
      <h2>Search Results</h2>
      <Grid container spacing={3}>
        {posts && posts.length ? (
          posts.map((p) => (
            <Post
              key={p.id}
              type={p.error || p.solution ? 'bugFix' : 'tip'}
              owner={p.owner}
              content={{
                links: p.links,
                image: SAMPLE_IMAGE_URL,
                lastModifiedDate: p.updatedAt,
                insertDate: p.createdAt,
                topics: p.topics,
                description: p.description,
                error: p.error,
                solution: p.solution,
              }}
            />
          ))) : null}
      </Grid>
    </div>
  );
};

export default SearchResults;
