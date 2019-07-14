exports.ids=[10],exports.modules={29:function(t,e,r){"use strict";r.r(e);var o={name:"reddit-update-form",props:["data"],data:()=>({listings:[{value:"hot",text:"Populaire"},{value:"new",text:"Nouveau"},{value:"rising",text:"En progression"},{value:"controversial",text:"Controversé"},{value:"top",text:"Le meilleur"},{value:"gilded",text:"Doré"}],limits:[{value:25,text:"Une page"},{value:50,text:"Deux pages"},{value:75,text:"Trois pages"},{value:100,text:"Quatre pages"}],redditID:"",name:"",listing:"",limit:0}),mounted(){this.redditID=this.data._id,this.name=this.data.name,this.listing=this.data.listing,this.limit=this.data.limit},methods:{submitUpdate(t){t.preventDefault(),this.$emit("submitUpdate",this.redditID,{name:this.name,listing:this.listing,limit:this.limit})},submitDelete(){this.$emit("submitDelete",this.redditID)}}},l=r(1),n={name:"Reddit",fetch:({store:t,redirect:e})=>t.state.auth.isAuth&&t.state.auth.hasAccess?void 0:e("/"),head(){return{titleTemplate:"%s - "+this.title}},data:()=>({title:"Module: Reddit",imageSubreddit:[],fields:[{key:"name",label:"Subreddit",sortable:!0,thStyle:{width:"40%"}},{key:"listing",label:"liste",sortable:!0,thStyle:{width:"40%"},formatter:"listingFormatter"},{key:"enabledCheckBox",label:"Activée",sortable:!0,thStyle:{width:"20%"}}],listingNames:{hot:"Populaire",new:"Nouveau",rising:"En progression",controversial:"Controversé",top:"Le meilleur",gilded:"Doré"},totalRows:1,currentPage:1,perPage:10,pageOptions:[5,10,15],showNewForm:!0,newForm:{name:"",listing:"hot",limit:25,type:"image"},listingSelectOptions:[{value:"hot",text:"Populaire"},{value:"new",text:"Nouveau"},{value:"rising",text:"En progression"},{value:"controversial",text:"Controversé"},{value:"top",text:"Le meilleur"},{value:"gilded",text:"Doré"}],limitSelectOptions:[{value:25,text:"Une page"},{value:50,text:"Deux pages"},{value:75,text:"Trois pages"},{value:100,text:"Quatre pages"}]}),async asyncData({$axios:t}){try{return{imageSubreddit:(await t.$get("reddit")).map(t=>({...t,_showDetails:!1,key:`${t._id}/${t.revision}`}))}}catch(t){}},mounted(){this.$store.dispatch("breadcrumbs/setCrumbs",this.$route.path),this.totalRows=this.imageSubreddit.length},methods:{async submitNew(t){t.preventDefault();try{await this.$axios({method:"post",data:{name:this.newForm.name,listing:this.newForm.listing,limit:this.newForm.limit,type:this.newForm.type},url:"reddit"});this.$toast.success("Subreddit ajoutée"),this.resetNew();try{const data=await this.$axios.$get("reddit");this.imageSubreddit=data.map(t=>({...t,_showDetails:!1,key:`${t._id}/${t.revision}`})),this.totalRows=this.imageSubreddit.length}catch(t){this.$axiosGetErrorHandler(t)}}catch(t){this.axiosPostError(t,"Erreur avec l'ajout du subreddit")}},async submitUpdate(t,data){this.hideRowDetails();try{if(0===(await this.$axios({method:"patch",data:data,url:"reddit/"+t})).data.modifed)this.$toast.warning("Aucune modification");else{this.$toast.success("Subreddit modifiée");try{const data=await this.$axios.$get("reddit");this.imageSubreddit=data.map(t=>({...t,_showDetails:!1,key:`${t._id}/${t.revision}`})),this.totalRows=this.imageSubreddit.length}catch(t){this.$axiosGetErrorHandler(t)}}}catch(t){this.axiosPostError(t,"Erreur avec l'édition du subreddit")}},async submitDelete(t){this.hideRowDetails();try{await this.$axios({method:"delete",url:"reddit/"+t}),this.$toast.success("Subreddit supprimée");try{const data=await this.$axios.$get("reddit");this.imageSubreddit=data.map(t=>({...t,_showDetails:!1,key:`${t._id}/${t.revision}`})),this.totalRows=this.imageSubreddit.length}catch(t){this.$axiosGetErrorHandler(t)}}catch(t){this.axiosPostError(t,"Erreur avec la suppression du subreddit")}},axiosPostError(t,e){this.$axiosPostErrorHandler(t,"Subreddit non trouvé","Ce subreddit existe déjà",e)},toggleEnabled(t,e){e?this.submitUpdate(t,{enabled:!1}):this.submitUpdate(t,{enabled:!0})},rowSelected(t){if(this.hideRowDetails(),!t.length)return;const e=t[0];e._showDetails=!e._showDetails},hideRowDetails(){this.imageSubreddit.map(t=>t._showDetails=!1)},resetNew(t){t&&t.preventDefault(),this.newForm.name="",this.newForm.listing="hot",this.newForm.limit=25,this.newForm.type="image",this.showNewForm=!1,this.$nextTick(()=>{this.showNewForm=!0})},listingFormatter(t){return this.listingNames[t]}},components:{RedditUpdateForm:Object(l.a)(o,function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:" p-3"},[r("b-form",{on:{submit:t.submitUpdate}},[r("b-form-group",[r("b-form-input",{attrs:{placeholder:"Le subreddit",required:""},model:{value:t.name,callback:function(e){t.name=e},expression:"name"}})],1),t._v(" "),r("b-form-group",[r("b-row",[r("b-col",[r("b-form-select",{attrs:{options:t.listings},model:{value:t.listing,callback:function(e){t.listing=e},expression:"listing"}})],1),t._v(" "),r("b-col",[r("b-form-select",{attrs:{options:t.limits},model:{value:t.limit,callback:function(e){t.limit=e},expression:"limit"}})],1)],1)],1),t._v(" "),r("b-form-group",[r("b-button",{attrs:{type:"submit",variant:"primary"}},[t._v("Modifier")]),t._v(" "),t.$store.state.auth.isOwner?r("b-button",{staticClass:"float-right",attrs:{variant:"danger"},on:{click:t.submitDelete}},[t._v("Supprimer")]):t._e()],1)],1)],1)},[],!1,null,null,"cb47b50a").exports}},d=Object(l.a)(n,function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",[r("b-jumbotron",{staticClass:"mt-3 mb-3 pt-4 pb-4",attrs:{fluid:"","bg-variant":"dark","text-variant":"light",header:"Module: Reddit",lead:"Poste les publications populaire, nouveau, en progression, controversé, le meilleur, doré, de Reddit."}}),t._ssrNode(" "),r("b-container",[r("b-breadcrumb",{attrs:{items:t.$store.state.breadcrumbs.crumbs}})],1),t._ssrNode(" "),t.imageSubreddit.length?r("b-container",{staticClass:"pb-5"},[r("b-table",{attrs:{hover:"","head-variant":"light",selectable:"","select-mode":"single",selectedVariant:"primary","current-page":t.currentPage,"per-page":t.perPage,items:t.imageSubreddit,fields:t.fields},on:{"row-selected":t.rowSelected},scopedSlots:t._u([{key:"enabledCheckBox",fn:function(e){return[r("b-form",[r("b-form-checkbox",{attrs:{name:"check-button",switch:""},on:{change:function(r){return t.toggleEnabled(e.item._id,e.item.enabled)}},model:{value:e.item.enabled,callback:function(r){t.$set(e.item,"enabled",r)},expression:"row.item.enabled"}})],1)]}},{key:"row-details",fn:function(e){return[r("RedditUpdateForm",{attrs:{data:e.item},on:{submitUpdate:t.submitUpdate,submitDelete:t.submitDelete}})]}}],null,!1,2987575972)}),t._v(" "),r("b-row",[r("b-col",[r("b-pagination",{staticClass:"my-0",attrs:{"total-rows":t.totalRows,"per-page":t.perPage},model:{value:t.currentPage,callback:function(e){t.currentPage=e},expression:"currentPage"}})],1),t._v(" "),r("b-col",[r("b-form-group",{staticClass:"mb-0",attrs:{"label-cols-sm":"3",label:"Nombre par page"}},[r("b-form-select",{attrs:{options:t.pageOptions},model:{value:t.perPage,callback:function(e){t.perPage=e},expression:"perPage"}})],1)],1)],1)],1):t._e(),t._ssrNode(" "),r("b-container",[r("h4",[t._v("Ajouter un nouveau sub")]),t._v(" "),r("hr",{staticClass:"border-primary"}),t._v(" "),t.showNewForm?r("b-form",{on:{submit:t.submitNew,reset:t.resetNew}},[r("b-form-group",[r("b-form-input",{attrs:{placeholder:"Le subreddit",required:""},model:{value:t.newForm.name,callback:function(e){t.$set(t.newForm,"name",e)},expression:"newForm.name"}})],1),t._v(" "),r("b-form-group",[r("b-row",[r("b-col",[r("b-form-select",{attrs:{options:t.listingSelectOptions},model:{value:t.newForm.listing,callback:function(e){t.$set(t.newForm,"listing",e)},expression:"newForm.listing"}})],1),t._v(" "),r("b-col",[r("b-form-select",{attrs:{options:t.limitSelectOptions},model:{value:t.newForm.limit,callback:function(e){t.$set(t.newForm,"limit",e)},expression:"newForm.limit"}})],1)],1)],1),t._v(" "),r("b-form-group",[r("b-button",{attrs:{type:"submit",variant:"primary"}},[t._v("Ajouter")]),t._v(" "),r("b-button",{attrs:{type:"reset"}},[t._v("Annuler")])],1)],1):t._e()],1)],2)},[],!1,null,null,"0aa7ca7f");e.default=d.exports}};
//# sourceMappingURL=252a18cf9fa6e38e3080.js.map