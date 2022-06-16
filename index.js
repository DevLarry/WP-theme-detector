let endpoint = "http://fetched.herokuapp.com";
let app = Vue.createApp({
	data() {
		return {
			url: "https://",
			loading: false,
			data: null,
			errorMessage: null,
			resolvedUrl: null
		};
	},
	methods: {
		FetchTheme() {
			this.loading = true;
			const { url } = this;
			axios
				.post(endpoint, {url})
				.then(res => {
					let { data, url } = res.data;
					let searchString = new RegExp(
						`${url}/wp-content/themes/[a-zA-z-]*/style.css`,
						"gi"
					);
					let themes = data.match(searchString);
					if (!themes) {
						this.loading = false;
						this.errorMessage = "No theme Detected!"
						return 
					}
					axios
						.post(endpoint, {url: themes[0]})
						.then(response => {
							let [str] = response.data.data
								.split(/(\/\*)|(\*\/)/)
								.filter(el => el && el.includes("Theme Name"));
							// console.log(str);
							if(!str){
								let url = response.data.url.split('/');
								this.errorMessage = "Detected theme: '"+url[url.length-2]+"', but no additional information was found, This theme might have been customized!"
								this.loading = false;
								return
							}
							this.data = str?.split('\n').filter(e=>e.length?true:false).map(e=>({key: e.split(': ')[0], value: e.split(': ')[1]}));
							this.resolvedUrl = url;
							this.loading = false
						})
						.catch((err)=>{
							this.loading = false;
							this.errorMessage = "Failed to load Theme, Check your URL and internet connection";
							// console.log(err.message);
						});
				})
				.catch((err)=>{
					this.loading = false;
					this.errorMessage = "Failed to load Theme, Check your URL and internet connection";
					// console.log(err.message);
				});
		},
	},
	computed: {
		err(){
			if(this.data) return this.url==resolvedUrl
			return this.errorMessage && !this.loading
		}
	},
}).mount("#search");
