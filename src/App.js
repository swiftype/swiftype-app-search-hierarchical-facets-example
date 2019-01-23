import React, { Component } from "react";
import { Layout, Result, SearchBox } from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";
import * as SwiftypeAppSearch from "swiftype-app-search-javascript";

import "./App.css";

var client = SwiftypeAppSearch.createClient({
  hostIdentifier: "host-n16af4",
  searchKey: "search-foueoyusuprj187kv7hyfof9",
  engineName: "hierarchichal-facets"
});

class App extends Component {
  state = {
    searchTerm: "",
    results: null,
    category1: "",
    category2: "",
    category3: ""
  };

  /*
    Converts filters object to array syntax for API
  */
  getFiltersArray(filters) {
    const { category1, category2, category3 } = filters;

    let arr = [];

    if (category1) {
      arr = [{ category1 }, ...arr];
    }

    if (category2) {
      arr = [{ category2 }, ...arr];
    }

    if (category3) {
      arr = [{ category3 }, ...arr];
    }

    return arr;
  }

  search = async newFilters => {
    let promises = [];

    const updatedFilters = { ...this.state, ...newFilters };

    promises = [
      ...promises,
      client.search(this.state.searchTerm, {
        filters: {
          all: this.getFiltersArray(updatedFilters)
        },
        facets: {
          // On each search we perform, we will fetch all of the facets we
          // need, and simply not show the ones we do not need.
          category1: [
            {
              type: "value"
            }
          ],
          category2: [
            {
              type: "value"
            }
          ],
          category3: [
            {
              type: "value"
            }
          ]
        }
      })
    ];

    // If we've filtered on our first dimension, we won't have
    // counts for ALL of our 1st level dimensions, we'd only have a count
    // for the currently selected dimension. We'll do a separate query
    // to get our first dimension's facet counts, and merge them into the
    // counts we get back from our search query.
    if (updatedFilters.category1) {
      promises = [...promises, this.getCategory1Facets()];
    }

    // Ditto
    if (updatedFilters.category2) {
      promises = [...promises, this.getCategory2Facets(updatedFilters)];
    }

    // Ditto
    if (updatedFilters.category3) {
      promises = [...promises, this.getCategory3Facets(updatedFilters)];
    }

    const [
      results,
      category1Facets,
      category2Facets,
      category3Facets
    ] = await Promise.all(promises);

    const facets = {
      ...category1Facets,
      ...category2Facets,
      ...category3Facets
    };

    // As mentioned above, we merge all of our individual facet queries back
    // into our search query results.
    results.info.facets = { ...results.info.facets, ...facets };

    return results;
  };

  getCategory1Facets = async () => {
    const results = await client.search(this.state.searchTerm, {
      page: {
        size: 0
      },
      facets: {
        category1: [
          {
            type: "value"
          }
        ]
      }
    });
    return results.info.facets;
  };

  getCategory2Facets = async newFilters => {
    const results = await client.search(this.state.searchTerm, {
      page: {
        size: 2
      },
      filters: {
        all: [{ category1: newFilters.category1 }]
      },
      facets: {
        category2: [
          {
            type: "value"
          }
        ]
      }
    });
    return results.info.facets;
  };

  getCategory3Facets = async newFilters => {
    const results = await client.search(this.state.searchTerm, {
      page: {
        size: 0
      },
      filters: {
        all: [
          { category1: newFilters.category1 },
          { category2: newFilters.category2 }
        ]
      },
      facets: {
        category3: [
          {
            type: "value"
          }
        ]
      }
    });
    return results.info.facets;
  };

  onSubmit = e => {
    e.preventDefault();

    this.search().then(results => {
      this.setState({
        results
      });
    });
  };

  onChange = e => {
    const searchTerm = e.target.value;
    this.setState({
      searchTerm
    });
  };

  handleClickCategory1 = category1 => {
    this.search({ category1 }).then(results => {
      this.setState({
        results,
        category1,
        category2: "",
        category3: ""
      });
    });
  };

  handleClickCategory2 = category2 => {
    this.search({ category2 }).then(results => {
      this.setState({
        results,
        category2,
        category3: ""
      });
    });
  };

  handleClickCategory3 = category3 => {
    this.search({ category3 }).then(results => {
      this.setState({
        results,
        category3
      });
    });
  };

  componentDidMount() {
    this.search().then(results => {
      this.setState({
        results
      });
    });
  }

  render() {
    return (
      <div>
        <Layout
          header={
            <SearchBox
              value={this.state.searchTerm}
              onChange={this.onChange}
              onSubmit={this.onSubmit}
            />
          }
          sideContent={
            <div>
              {this.state.results && (
                <div>
                  {this.state.results.info.facets["category1"][0].data.map(
                    category1Facet => (
                      <div key={category1Facet.value}>
                        <span
                          className="selectable"
                          onClick={e => {
                            e.preventDefault();
                            this.handleClickCategory1(category1Facet.value);
                          }}
                        >
                          {category1Facet.value} ({category1Facet.count})
                        </span>
                        {this.state.category1 === category1Facet.value && (
                          <div>
                            {this.state.results.info.facets[
                              "category2"
                            ][0].data.map(category2Facet => (
                              <div key={category2Facet.value}>
                                &nbsp;&nbsp;
                                <span
                                  className="selectable"
                                  onClick={e => {
                                    e.preventDefault();
                                    this.handleClickCategory2(
                                      category2Facet.value
                                    );
                                  }}
                                >
                                  {category2Facet.value} ({category2Facet.count}
                                  )
                                </span>
                                {this.state.category2 ===
                                  category2Facet.value && (
                                  <div>
                                    {this.state.results.info.facets[
                                      "category3"
                                    ][0].data.map(category3Facet => (
                                      <div key={category3Facet.value}>
                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                        <span
                                          className="selectable"
                                          onClick={e => {
                                            e.preventDefault();
                                            this.handleClickCategory3(
                                              category3Facet.value
                                            );
                                          }}
                                        >
                                          {category3Facet.value} (
                                          {category3Facet.count})
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          }
          bodyContent={
            <div>
              {this.state.results &&
                this.state.results.results.map(result => (
                  <Result
                    key={result.getRaw("id")}
                    fields={{
                      category1: result.getRaw("category1"),
                      category2: result.getRaw("category2"),
                      category3: result.getRaw("category3")
                    }}
                    title={result.getRaw("name")}
                    onClickLink={() => {}}
                  />
                ))}
            </div>
          }
        />
      </div>
    );
  }
}

export default App;
