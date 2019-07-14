(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{202:function(e,t,r){"use strict";r.r(t);r(7);var n=r(0),o=(r(42),r(13)),l={name:"reddit-update-form",props:["data"],data:function(){return{listings:[{value:"hot",text:"Populaire"},{value:"new",text:"Nouveau"},{value:"rising",text:"En progression"},{value:"controversial",text:"Controversé"},{value:"top",text:"Le meilleur"},{value:"gilded",text:"Doré"}],limits:[{value:25,text:"Une page"},{value:50,text:"Deux pages"},{value:75,text:"Trois pages"},{value:100,text:"Quatre pages"}],redditID:"",name:"",listing:"",limit:0}},mounted:function(){this.redditID=this.data._id,this.name=this.data.name,this.listing=this.data.listing,this.limit=this.data.limit},methods:{submitUpdate:function(e){e.preventDefault(),this.$emit("submitUpdate",this.redditID,{name:this.name,listing:this.listing,limit:this.limit})},submitDelete:function(){this.$emit("submitDelete",this.redditID)}}},c=r(24),d=Object(c.a)(l,function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",{staticClass:" p-3"},[r("b-form",{on:{submit:e.submitUpdate}},[r("b-form-group",[r("b-form-input",{attrs:{placeholder:"Le subreddit",required:""},model:{value:e.name,callback:function(t){e.name=t},expression:"name"}})],1),e._v(" "),r("b-form-group",[r("b-row",[r("b-col",[r("b-form-select",{attrs:{options:e.listings},model:{value:e.listing,callback:function(t){e.listing=t},expression:"listing"}})],1),e._v(" "),r("b-col",[r("b-form-select",{attrs:{options:e.limits},model:{value:e.limit,callback:function(t){e.limit=t},expression:"limit"}})],1)],1)],1),e._v(" "),r("b-form-group",[r("b-button",{attrs:{type:"submit",variant:"primary"}},[e._v("Modifier")]),e._v(" "),e.$store.state.auth.isOwner?r("b-button",{staticClass:"float-right",attrs:{variant:"danger"},on:{click:e.submitDelete}},[e._v("Supprimer")]):e._e()],1)],1)],1)},[],!1,null,null,null).exports,m={name:"Reddit",fetch:function(e){var t=e.store,r=e.redirect;return t.state.auth.isAuth&&t.state.auth.hasAccess?void 0:r("/")},head:function(){return{titleTemplate:"%s - "+this.title}},data:function(){return{title:"Module: Reddit",imageSubreddit:[],fields:[{key:"name",label:"Subreddit",sortable:!0,thStyle:{width:"40%"}},{key:"listing",label:"liste",sortable:!0,thStyle:{width:"40%"},formatter:"listingFormatter"},{key:"enabledCheckBox",label:"Activée",sortable:!0,thStyle:{width:"20%"}}],listingNames:{hot:"Populaire",new:"Nouveau",rising:"En progression",controversial:"Controversé",top:"Le meilleur",gilded:"Doré"},totalRows:1,currentPage:1,perPage:10,pageOptions:[5,10,15],showNewForm:!0,newForm:{name:"",listing:"hot",limit:25,type:"image"},listingSelectOptions:[{value:"hot",text:"Populaire"},{value:"new",text:"Nouveau"},{value:"rising",text:"En progression"},{value:"controversial",text:"Controversé"},{value:"top",text:"Le meilleur"},{value:"gilded",text:"Doré"}],limitSelectOptions:[{value:25,text:"Une page"},{value:50,text:"Deux pages"},{value:75,text:"Trois pages"},{value:100,text:"Quatre pages"}]}},asyncData:function(){var e=Object(o.a)(regeneratorRuntime.mark(function e(t){var r,data,o;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return r=t.$axios,e.prev=1,e.next=4,r.$get("reddit");case 4:return data=e.sent,o=data.map(function(e){return Object(n.a)({},e,{_showDetails:!1,key:"".concat(e._id,"/").concat(e.revision)})}),e.abrupt("return",{imageSubreddit:o});case 9:e.prev=9,e.t0=e.catch(1);case 11:case"end":return e.stop()}},e,null,[[1,9]])}));return function(t){return e.apply(this,arguments)}}(),mounted:function(){this.$store.dispatch("breadcrumbs/setCrumbs",this.$route.path),this.totalRows=this.imageSubreddit.length},methods:{submitNew:function(){var e=Object(o.a)(regeneratorRuntime.mark(function e(t){var data;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t.preventDefault(),e.prev=1,e.next=4,this.$axios({method:"post",data:{name:this.newForm.name,listing:this.newForm.listing,limit:this.newForm.limit,type:this.newForm.type},url:"reddit"});case 4:return e.sent,this.$toast.success("Subreddit ajoutée"),this.resetNew(),e.prev=7,e.next=10,this.$axios.$get("reddit");case 10:data=e.sent,this.imageSubreddit=data.map(function(e){return Object(n.a)({},e,{_showDetails:!1,key:"".concat(e._id,"/").concat(e.revision)})}),this.totalRows=this.imageSubreddit.length,e.next=18;break;case 15:e.prev=15,e.t0=e.catch(7),this.$axiosGetErrorHandler(e.t0);case 18:e.next=23;break;case 20:e.prev=20,e.t1=e.catch(1),this.axiosPostError(e.t1,"Erreur avec l'ajout du subreddit");case 23:case"end":return e.stop()}},e,this,[[1,20],[7,15]])}));return function(t){return e.apply(this,arguments)}}(),submitUpdate:function(){var e=Object(o.a)(regeneratorRuntime.mark(function e(t,data){var r;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return this.hideRowDetails(),e.prev=1,e.next=4,this.$axios({method:"patch",data:data,url:"reddit/"+t});case 4:if(0!==e.sent.data.modifed){e.next=9;break}this.$toast.warning("Aucune modification"),e.next=21;break;case 9:return this.$toast.success("Subreddit modifiée"),e.prev=10,e.next=13,this.$axios.$get("reddit");case 13:r=e.sent,this.imageSubreddit=r.map(function(e){return Object(n.a)({},e,{_showDetails:!1,key:"".concat(e._id,"/").concat(e.revision)})}),this.totalRows=this.imageSubreddit.length,e.next=21;break;case 18:e.prev=18,e.t0=e.catch(10),this.$axiosGetErrorHandler(e.t0);case 21:e.next=26;break;case 23:e.prev=23,e.t1=e.catch(1),this.axiosPostError(e.t1,"Erreur avec l'édition du subreddit");case 26:case"end":return e.stop()}},e,this,[[1,23],[10,18]])}));return function(t,r){return e.apply(this,arguments)}}(),submitDelete:function(){var e=Object(o.a)(regeneratorRuntime.mark(function e(t){var data;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return this.hideRowDetails(),e.prev=1,e.next=4,this.$axios({method:"delete",url:"reddit/"+t});case 4:return this.$toast.success("Subreddit supprimée"),e.prev=5,e.next=8,this.$axios.$get("reddit");case 8:data=e.sent,this.imageSubreddit=data.map(function(e){return Object(n.a)({},e,{_showDetails:!1,key:"".concat(e._id,"/").concat(e.revision)})}),this.totalRows=this.imageSubreddit.length,e.next=16;break;case 13:e.prev=13,e.t0=e.catch(5),this.$axiosGetErrorHandler(e.t0);case 16:e.next=21;break;case 18:e.prev=18,e.t1=e.catch(1),this.axiosPostError(e.t1,"Erreur avec la suppression du subreddit");case 21:case"end":return e.stop()}},e,this,[[1,18],[5,13]])}));return function(t){return e.apply(this,arguments)}}(),axiosPostError:function(e,t){this.$axiosPostErrorHandler(e,"Subreddit non trouvé","Ce subreddit existe déjà",t)},toggleEnabled:function(e,t){t?this.submitUpdate(e,{enabled:!1}):this.submitUpdate(e,{enabled:!0})},rowSelected:function(e){if(this.hideRowDetails(),e.length){var t=e[0];t._showDetails=!t._showDetails}},hideRowDetails:function(){this.imageSubreddit.map(function(e){return e._showDetails=!1})},resetNew:function(e){var t=this;e&&e.preventDefault(),this.newForm.name="",this.newForm.listing="hot",this.newForm.limit=25,this.newForm.type="image",this.showNewForm=!1,this.$nextTick(function(){t.showNewForm=!0})},listingFormatter:function(e){return this.listingNames[e]}},components:{RedditUpdateForm:d}},h=Object(c.a)(m,function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",[r("b-jumbotron",{staticClass:"mt-3 mb-3 pt-4 pb-4",attrs:{fluid:"","bg-variant":"dark","text-variant":"light",header:"Module: Reddit",lead:"Poste les publications populaire, nouveau, en progression, controversé, le meilleur, doré, de Reddit."}}),e._v(" "),r("b-container",[r("b-breadcrumb",{attrs:{items:e.$store.state.breadcrumbs.crumbs}})],1),e._v(" "),e.imageSubreddit.length?r("b-container",{staticClass:"pb-5"},[r("b-table",{attrs:{hover:"","head-variant":"light",selectable:"","select-mode":"single",selectedVariant:"primary","current-page":e.currentPage,"per-page":e.perPage,items:e.imageSubreddit,fields:e.fields},on:{"row-selected":e.rowSelected},scopedSlots:e._u([{key:"enabledCheckBox",fn:function(t){return[r("b-form",[r("b-form-checkbox",{attrs:{name:"check-button",switch:""},on:{change:function(r){return e.toggleEnabled(t.item._id,t.item.enabled)}},model:{value:t.item.enabled,callback:function(r){e.$set(t.item,"enabled",r)},expression:"row.item.enabled"}})],1)]}},{key:"row-details",fn:function(t){return[r("RedditUpdateForm",{attrs:{data:t.item},on:{submitUpdate:e.submitUpdate,submitDelete:e.submitDelete}})]}}],null,!1,2987575972)}),e._v(" "),r("b-row",[r("b-col",[r("b-pagination",{staticClass:"my-0",attrs:{"total-rows":e.totalRows,"per-page":e.perPage},model:{value:e.currentPage,callback:function(t){e.currentPage=t},expression:"currentPage"}})],1),e._v(" "),r("b-col",[r("b-form-group",{staticClass:"mb-0",attrs:{"label-cols-sm":"3",label:"Nombre par page"}},[r("b-form-select",{attrs:{options:e.pageOptions},model:{value:e.perPage,callback:function(t){e.perPage=t},expression:"perPage"}})],1)],1)],1)],1):e._e(),e._v(" "),r("b-container",[r("h4",[e._v("Ajouter un nouveau sub")]),e._v(" "),r("hr",{staticClass:"border-primary"}),e._v(" "),e.showNewForm?r("b-form",{on:{submit:e.submitNew,reset:e.resetNew}},[r("b-form-group",[r("b-form-input",{attrs:{placeholder:"Le subreddit",required:""},model:{value:e.newForm.name,callback:function(t){e.$set(e.newForm,"name",t)},expression:"newForm.name"}})],1),e._v(" "),r("b-form-group",[r("b-row",[r("b-col",[r("b-form-select",{attrs:{options:e.listingSelectOptions},model:{value:e.newForm.listing,callback:function(t){e.$set(e.newForm,"listing",t)},expression:"newForm.listing"}})],1),e._v(" "),r("b-col",[r("b-form-select",{attrs:{options:e.limitSelectOptions},model:{value:e.newForm.limit,callback:function(t){e.$set(e.newForm,"limit",t)},expression:"newForm.limit"}})],1)],1)],1),e._v(" "),r("b-form-group",[r("b-button",{attrs:{type:"submit",variant:"primary"}},[e._v("Ajouter")]),e._v(" "),r("b-button",{attrs:{type:"reset"}},[e._v("Annuler")])],1)],1):e._e()],1)],1)},[],!1,null,null,null);t.default=h.exports}}]);