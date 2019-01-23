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

  getFilters(filters) {
    const { category1, category2, category3 } = { ...this.state, ...filters };

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

  search = async filters => {
    let promises = [];

    const newFilters = { ...this.state, ...filters };

    promises = [
      ...promises,
      client.search(this.state.searchTerm, {
        filters: {
          all: this.getFilters(newFilters)
        },
        facets: {
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

    promises = [...promises, this.getCategory1Facets()];
    if (newFilters.category1) {
      promises = [...promises, this.getCategory2Facets(newFilters)];
    }

    if (newFilters.category2) {
      promises = [...promises, this.getCategory3Facets(newFilters)];
    }

    const [
      results,
      category1Facets,
      category2Facets,
      category3Facets
    ] = await Promise.all(promises);

    let facets = {};
    facets = { ...facets, ...category1Facets };
    facets = { ...facets, ...category2Facets };
    facets = { ...facets, ...category3Facets };

    results.info.facets = facets;
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

  getCategory2Facets = async filters => {
    const results = await client.search(this.state.searchTerm, {
      page: {
        size: 2
      },
      filters: {
        all: [{ category1: filters.category1 }]
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

  getCategory3Facets = async filters => {
    const results = await client.search(this.state.searchTerm, {
      page: {
        size: 0
      },
      filters: {
        all: [
          { category1: filters.category1 },
          { category2: filters.category2 }
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
                    thing => (
                      <div key={thing.value}>
                        <span
                          className={"selectable"}
                          onClick={e => {
                            e.preventDefault();
                            this.handleClickCategory1(thing.value);
                          }}
                        >
                          {thing.value} ({thing.count})
                        </span>
                        {this.state.category1 === thing.value && (
                          <div>
                            {this.state.results.info.facets[
                              "category2"
                            ][0].data.map(thing => (
                              <div key={thing.value}>
                                &nbsp;&nbsp;
                                <span
                                  className={"selectable"}
                                  onClick={e => {
                                    e.preventDefault();
                                    this.handleClickCategory2(thing.value);
                                  }}
                                >
                                  {thing.value} ({thing.count})
                                </span>
                                {this.state.category2 === thing.value && (
                                  <div>
                                    {this.state.results.info.facets[
                                      "category3"
                                    ][0].data.map(thing => (
                                      <div key={thing.value}>
                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                        <span
                                          className={"selectable"}
                                          onClick={e => {
                                            e.preventDefault();
                                            this.handleClickCategory3(
                                              thing.value
                                            );
                                          }}
                                        >
                                          {thing.value} ({thing.count})
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
