import React from 'react';
import './SearchBar.css';

class SearchBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {searchTerm: ''};
		this.search = this.search.bind(this);
		this.handleTermChange = this.handleTermChange.bind(this);
	}

	search(event) {
		if (this.state.searchTerm.length > 0) {
			this.props.onSearch(this.state.searchTerm);
			event.preventDefault();
		}
		else {
			alert('You must enter a search term.');
			event.preventDefault();
		}
	}

	handleTermChange(event) {
		this.setState({searchTerm: event.target.value});
	}

	render() {
		return (
			<div className="SearchBar">
			  <input onChange={this.handleTermChange} placeholder="Enter A Song, Album, or Artist" />
			  <a onClick={this.search}>SEARCH</a>
			</div>
		);
	}
}

export default SearchBar;