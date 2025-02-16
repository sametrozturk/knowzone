import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconButton, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { toast } from 'react-toastify';
import { isEmpty } from 'lodash';
import SearchOptions from './SearchOptions';
import { GRAY2, GRAY3, PRIMARY } from '../../constants/colors';
import { FE_ROUTES } from '../../constants/routes';
import { searchBarHeight } from '../../constants/styles';

const PREFIX = 'SearchBar';

const classes = {
  searchBarWrapper: `${PREFIX}-searchBarWrapper`,
  searchBar: `${PREFIX}-searchBar`,
  searchIconWrapper: `${PREFIX}-searchIconWrapper`,
  searchIcon: `${PREFIX}-searchIcon`,
  searchInputWrapper: `${PREFIX}-searchInputWrapper`,
  searchInput: `${PREFIX}-searchInput`,
  optionsIconButtonWrapper: `${PREFIX}-optionsIconButtonWrapper`,
};

const Root = styled(Grid)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  zIndex: 3,
  height: searchBarHeight,
  border: `1px solid ${GRAY3}`,
  borderRadius: 6,
  position: 'relative',

  [`& .${classes.searchBar}`]: {
    display: 'flex',
    flex: 1,
  },

  [`& .${classes.searchIconWrapper}`]: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    color: GRAY2,
  },

  [`& .${classes.searchIcon}`]: {
    width: 20,
    height: 20,
    lineHeight: 20,
  },

  [`& .${classes.searchInputWrapper}`]: {
    display: 'flex',
    flex: 1,
    flexWrap: 'wrap',
  },

  [`& .${classes.searchInput}`]: {
    display: 'flex',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '100%',
    outline: 'none',
    wordWrap: 'break-word',
    border: 'none',
    fontSize: 16,
  },

  [`& .${classes.optionsIconButtonWrapper}`]: {
    display: 'flex',
    flexBasis: 'auto',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
  },
}));

function SearchBar() {
  const emptySearchOptions = {
    searchText: '',
    typeName: '',
    topics: [],
    createdAtStartDate: null,
    createdAtEndDate: null,
    updatedAtStartDate: null,
    updatedAtEndDate: null,
  };
  const [searchOptions, setSearchOptions] = useState(emptySearchOptions);
  const [isSearchOptionsMenuOpen, setIsSearchOptionsMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const toggleSearchOptionsMenu = () => setIsSearchOptionsMenuOpen(!isSearchOptionsMenuOpen);

  const hideSearchOptionsMenu = () => setIsSearchOptionsMenuOpen(false);

  const handleDateChange = (prop) => (date) => setSearchOptions({ ...searchOptions, [prop]: date });

  const handleOptionChange = (prop) => (event) => (
    setSearchOptions({ ...searchOptions, [prop]: event.target.value })
  );

  const handleResetOnClick = () => setSearchOptions(emptySearchOptions);

  const areAllSearchOptionsEmpty = () => {
    const { searchText, ...rest } = searchOptions;
    return Object.values(rest).every((value) => isEmpty(value)) && !searchText.trim();
  };

  const checkAllSearchOptions = () => !areAllSearchOptionsEmpty();

  const checkDates = () => {
    if ((searchOptions.createdAtStartDate && searchOptions.createdAtEndDate)
      && (searchOptions.createdAtStartDate > searchOptions.createdAtEndDate)) {
      return false;
    }
    if ((searchOptions.updatedAtStartDate && searchOptions.updatedAtEndDate)
      && (searchOptions.updatedAtStartDate > searchOptions.updatedAtEndDate)) {
      return false;
    }
    return true;
  };

  const search = () => {
    const searchOptionsBodyState = { ...searchOptions };

    Object.entries(searchOptions).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && !value.length)) {
        delete searchOptionsBodyState[key];
      }
    });

    hideSearchOptionsMenu();
    navigate(`/${FE_ROUTES.SEARCH_RESULTS}`, { state: { searchOptionsBodyState } });
  };

  const searchOrGiveError = () => {
    if (areAllSearchOptionsEmpty()) {
      toast.error('Could not search! Type what to search or specify search options correctly.');
    } else if (!checkDates()) {
      toast.error('Invalid dates!');
    } else {
      search();
    }
  };

  const handleSearchOnClick = () => {
    searchOrGiveError();
  };

  const handleOnPressEnter = (event) => {
    if (event.key === 'Enter') {
      searchOrGiveError();
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      const { searchOptionsBodyState } = location.state ?? {};

      if (location.pathname !== `/${FE_ROUTES.SEARCH_RESULTS}` && checkAllSearchOptions()) {
        handleResetOnClick();
      } else if (location.state !== undefined) {
        setSearchOptions({ ...emptySearchOptions, ...searchOptionsBodyState });
      }
    }
    return function cleanup() {
      mounted = false;
    };
  }, [location.pathname, location.state]);

  return (
    <Root item xs={12} sm={7} md={7} lg={7}>
      <div className={classes.searchBar}>
        <div className={classes.searchIconWrapper}>
          <SearchIcon className={classes.searchIcon} />
        </div>
        <div className={classes.searchInputWrapper}>
          <input
            className={classes.searchInput}
            type="text"
            placeholder="Search"
            value={searchOptions.searchText}
            onKeyDown={handleOnPressEnter}
            onChange={handleOptionChange('searchText')}
          />
        </div>
        <div className={classes.optionsIconButtonWrapper}>
          <IconButton
            aria-label="search options"
            aria-controls="menu-search"
            aria-haspopup="true"
            style={{ width: 35, height: 35, color: PRIMARY }}
            onClick={toggleSearchOptionsMenu}
            size="large"
          >
            <TuneIcon />
          </IconButton>
        </div>
      </div>
      {isSearchOptionsMenuOpen && (
        <SearchOptions
          options={searchOptions}
          setTopics={(topics) => setSearchOptions({ ...searchOptions, topics })}
          handleOptionChange={handleOptionChange}
          handleDateChange={handleDateChange}
          handleSearchOnClick={handleSearchOnClick}
          handleResetOnClick={handleResetOnClick}
        />
      )}
    </Root>
  );
}

export default SearchBar;
