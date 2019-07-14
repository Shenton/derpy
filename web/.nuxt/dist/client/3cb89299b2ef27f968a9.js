(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{206:function(t,e,r){"use strict";r.r(e);var n=r(0),o=(r(42),r(13)),l={name:"command-update-form",props:["data"],data:function(){return{commandID:null,allowedChannels:[],roles:[],form:{allowedChannels:[],allowedRoles:[]},textOptions:[],rolesOptions:[]}},mounted:function(){this.textOptions=this.$store.state.botinfo.info.textOptions,this.rolesOptions=this.$store.state.botinfo.info.rolesOptions,this.commandID=this.data._id,this.allowedChannels=this.data.allowedChannels,this.allowedRoles=this.data.allowedRoles,this.setDefaultValues()},methods:{setDefaultValues:function(){this.form.allowedChannels=this.data.allowedChannels,this.form.allowedRoles=this.data.allowedRoles},submitUpdate:function(t){t.preventDefault(),this.$emit("submitUpdate",this.commandID,{allowedChannels:this.form.allowedChannels,allowedRoles:this.form.allowedRoles})}}},c=r(24),m=Object(c.a)(l,function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:" p-3"},[r("b-form",{on:{submit:t.submitUpdate}},[r("b-card",{staticClass:"mb-3",attrs:{"no-body":""}},[r("b-tabs",{attrs:{"content-class":"mt-3",fill:"",card:""}},[r("b-tab",{attrs:{title:"Canaux"}},[r("b-form-group",{attrs:{label:"Sélectionne sur quels canaux textuels la commande peut être exécutée"}},[r("b-form-checkbox-group",{attrs:{options:t.textOptions,switches:"",stacked:""},model:{value:t.form.allowedChannels,callback:function(e){t.$set(t.form,"allowedChannels",e)},expression:"form.allowedChannels"}})],1)],1),t._v(" "),r("b-tab",{attrs:{title:"Roles"}},[r("b-form-group",{attrs:{label:"Sélectionne quels roles peuvent exécuter la commande"}},[r("b-form-checkbox-group",{attrs:{options:t.rolesOptions,switches:"",stacked:""},model:{value:t.form.allowedRoles,callback:function(e){t.$set(t.form,"allowedRoles",e)},expression:"form.allowedRoles"}})],1)],1)],1)],1),t._v(" "),r("b-row",[r("b-col",[r("b-button",{attrs:{type:"submit",block:"",variant:"primary"}},[t._v("Appliquer les modifications")])],1),t._v(" "),r("b-col",[r("b-button",{attrs:{block:"",variant:"secondary"},on:{click:function(e){return t.setDefaultValues()}}},[t._v("Annuler les modifications")])],1)],1)],1)],1)},[],!1,null,null,null).exports,d={name:"Commandes",fetch:function(t){var e=t.store,r=t.redirect;return e.state.auth.isAuth&&e.state.auth.isOwner?void 0:r("/")},head:function(){return{titleTemplate:"%s - "+this.title}},data:function(){return{title:"Administration: Commandes",commands:[],fields:[{key:"name",label:"Commande",sortable:!0,thStyle:{width:"80%"}},{key:"enabledCheckBox",label:"Activée",sortable:!0,thStyle:{width:"20%"}}],totalRows:1,currentPage:1,perPage:10,pageOptions:[5,10,15],restarting:!1,restartVariant:"primary"}},asyncData:function(){var t=Object(o.a)(regeneratorRuntime.mark(function t(e){var r,data,o;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return r=e.$axios,t.prev=1,t.next=4,r.$get("commands");case 4:return data=t.sent,o=data.map(function(t){return Object(n.a)({},t,{_showDetails:!1,key:"".concat(t._id,"/").concat(t.revision)})}),t.abrupt("return",{commands:o});case 9:t.prev=9,t.t0=t.catch(1);case 11:case"end":return t.stop()}},t,null,[[1,9]])}));return function(e){return t.apply(this,arguments)}}(),mounted:function(){this.$store.dispatch("breadcrumbs/setCrumbs",this.$route.path),this.totalRows=this.commands.length},methods:{submitUpdate:function(){var t=Object(o.a)(regeneratorRuntime.mark(function t(e,data){var r;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return this.hideRowDetails(),t.prev=1,t.next=4,this.$axios({method:"patch",data:data,url:"commands/"+e});case 4:if(0!==t.sent.data.modifed){t.next=9;break}this.$toast.warning("Aucune modification"),t.next=21;break;case 9:return this.$toast.success("Commande modifiée"),t.prev=10,t.next=13,this.$axios.$get("commands");case 13:r=t.sent,this.commands=r.map(function(t){return Object(n.a)({},t,{_showDetails:!1,key:"".concat(t._id,"/").concat(t.revision)})}),this.totalRows=this.commands.length,t.next=21;break;case 18:t.prev=18,t.t0=t.catch(10),this.$axiosGetErrorHandler(t.t0);case 21:t.next=26;break;case 23:t.prev=23,t.t1=t.catch(1),this.axiosPostError(t.t1,"Erreur avec l'édition de la commande");case 26:case"end":return t.stop()}},t,this,[[1,23],[10,18]])}));return function(e,r){return t.apply(this,arguments)}}(),axiosPostError:function(t,e){this.$axiosPostErrorHandler(t,"Commande non trouvée","Cette commande existe déjà",e)},toggleEnabled:function(t,e){e?this.submitUpdate(t,{enabled:!1}):this.submitUpdate(t,{enabled:!0})},rowSelected:function(t){if(this.hideRowDetails(),t.length){var e=t[0];e._showDetails=!e._showDetails}},hideRowDetails:function(){this.commands.map(function(t){return t._showDetails=!1})},restartDerpy:function(){var t=Object(o.a)(regeneratorRuntime.mark(function t(){var e=this;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,this.restarting=!0,t.next=4,this.$axios.$get("system/restart");case 4:t.sent,this.restarting=!1,this.restartVariant="success",setTimeout(function(){return e.restartVariant="primary"},3e3),t.next=15;break;case 10:t.prev=10,t.t0=t.catch(0),this.restarting=!1,this.restartVariant="danger",setTimeout(function(){return e.restartVariant="primary"},3e3);case 15:case"end":return t.stop()}},t,this,[[0,10]])}));return function(){return t.apply(this,arguments)}}()},components:{CommandUpdateForm:m}},h=Object(c.a)(d,function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",[r("b-jumbotron",{staticClass:"mt-3 mb-3 pt-4 pb-4",attrs:{fluid:"","bg-variant":"dark","text-variant":"light",header:"Administration: Commandes",lead:"Configure les commandes de Derpy."}}),t._v(" "),r("b-container",[r("b-breadcrumb",{attrs:{items:t.$store.state.breadcrumbs.crumbs}})],1),t._v(" "),t.commands.length?r("b-container",{staticClass:"pb-5"},[r("b-table",{attrs:{hover:"","head-variant":"light",selectable:"","select-mode":"single",selectedVariant:"primary","current-page":t.currentPage,"per-page":t.perPage,items:t.commands,fields:t.fields},on:{"row-selected":t.rowSelected},scopedSlots:t._u([{key:"enabledCheckBox",fn:function(e){return[r("b-form",[r("b-form-checkbox",{attrs:{name:"check-button",switch:""},on:{change:function(r){return t.toggleEnabled(e.item._id,e.item.enabled)}},model:{value:e.item.enabled,callback:function(r){t.$set(e.item,"enabled",r)},expression:"row.item.enabled"}})],1)]}},{key:"row-details",fn:function(e){return[r("CommandUpdateForm",{attrs:{data:e.item},on:{submitUpdate:t.submitUpdate}})]}}],null,!1,972628415)}),t._v(" "),r("b-row",[r("b-col",[r("b-pagination",{staticClass:"my-0",attrs:{"total-rows":t.totalRows,"per-page":t.perPage},model:{value:t.currentPage,callback:function(e){t.currentPage=e},expression:"currentPage"}})],1),t._v(" "),r("b-col",[r("b-form-group",{staticClass:"mb-0",attrs:{"label-cols-sm":"3",label:"Nombre par page"}},[r("b-form-select",{attrs:{options:t.pageOptions},model:{value:t.perPage,callback:function(e){t.perPage=e},expression:"perPage"}})],1)],1)],1),t._v(" "),r("hr",{staticClass:"border-primary"}),t._v(" "),r("p",[t._v("Pour que les modifications soit prisent en compte, il faut redémarrer Derpy.")]),t._v(" "),r("b-button",{attrs:{block:"",variant:t.restartVariant},on:{click:function(e){return t.restartDerpy()}}},[t.restarting?r("b-spinner",{attrs:{small:""}}):r("span",[t._v("Redémarrer Derpy")])],1)],1):t._e()],1)},[],!1,null,null,null);e.default=h.exports}}]);