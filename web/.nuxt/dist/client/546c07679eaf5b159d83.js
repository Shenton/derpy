(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{209:function(e,t,r){"use strict";r.r(t);var n=r(0),c=(r(42),r(13)),o={name:"Membres",fetch:function(e){var t=e.store,r=e.redirect;return t.state.auth.isAuth&&t.state.auth.isOwner?void 0:r("/")},head:function(){return{titleTemplate:"%s - "+this.title}},data:function(){return{title:"Administration: Membres",members:[],fields:[{key:"fullName",label:"Membre",sortable:!0,thStyle:{width:"80%"}},{key:"accessCheckBox",label:"Accès",sortable:!0,thStyle:{width:"20%"}}],totalRows:1,currentPage:1,perPage:10,pageOptions:[5,10,15]}},asyncData:function(){var e=Object(c.a)(regeneratorRuntime.mark(function e(t){var r,data,c;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return r=t.$axios,e.prev=1,e.next=4,r.$get("members");case 4:return data=e.sent,c=data.map(function(e){return Object(n.a)({},e,{key:"".concat(e._id,"/").concat(e.revision)})}),e.abrupt("return",{members:c});case 9:e.prev=9,e.t0=e.catch(1);case 11:case"end":return e.stop()}},e,null,[[1,9]])}));return function(t){return e.apply(this,arguments)}}(),mounted:function(){this.$store.dispatch("breadcrumbs/setCrumbs",this.$route.path),this.totalRows=this.members.length},methods:{submitUpdate:function(){var e=Object(c.a)(regeneratorRuntime.mark(function e(t,data){var r;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,this.$axios({method:"patch",data:data,url:"members/"+t});case 3:if(0!==e.sent.data.modifed){e.next=8;break}this.$toast.warning("Aucune modification"),e.next=20;break;case 8:return this.$toast.success("Membre modifié"),e.prev=9,e.next=12,this.$axios.$get("members");case 12:r=e.sent,this.members=r.map(function(e){return Object(n.a)({},e,{key:"".concat(e._id,"/").concat(e.revision)})}),this.totalRows=this.members.length,e.next=20;break;case 17:e.prev=17,e.t0=e.catch(9),this.$axiosGetErrorHandler(e.t0);case 20:e.next=25;break;case 22:e.prev=22,e.t1=e.catch(0),this.axiosPostError(e.t1,"Erreur avec l'édition du membre");case 25:case"end":return e.stop()}},e,this,[[0,22],[9,17]])}));return function(t,r){return e.apply(this,arguments)}}(),axiosPostError:function(e,t){this.$axiosPostErrorHandler(e,"Activité non trouvée","Cette activité existe déjà",t)},toggleAccess:function(e,t){t?this.submitUpdate(e,{hasAccess:!1}):this.submitUpdate(e,{hasAccess:!0})}}},m=r(24),component=Object(m.a)(o,function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",[r("b-jumbotron",{staticClass:"mt-3 mb-3 pt-4 pb-4",attrs:{fluid:"","bg-variant":"dark","text-variant":"light",header:"Administration: Membres",lead:"L'administration des membres."}}),e._v(" "),r("b-container",[r("b-breadcrumb",{attrs:{items:e.$store.state.breadcrumbs.crumbs}})],1),e._v(" "),e.members.length?r("b-container",{staticClass:"pb-5"},[r("b-table",{attrs:{hover:"","head-variant":"light","current-page":e.currentPage,"per-page":e.perPage,items:e.members,fields:e.fields},scopedSlots:e._u([{key:"fullName",fn:function(t){return[e._v("\r\n                "+e._s(t.item.username)),r("span",{staticClass:"text-primary"},[e._v("#"+e._s(t.item.discriminator))]),e._v(e._s(t.item.isOwner?"  (Owner)":"")+"\r\n            ")]}},{key:"accessCheckBox",fn:function(t){return[r("b-form",[r("b-form-checkbox",{attrs:{name:"check-button",switch:""},on:{change:function(r){return e.toggleAccess(t.item._id,t.item.hasAccess)}},model:{value:t.item.hasAccess,callback:function(r){e.$set(t.item,"hasAccess",r)},expression:"row.item.hasAccess"}})],1)]}}],null,!1,450159306)}),e._v(" "),r("b-row",[r("b-col",[r("b-pagination",{staticClass:"my-0",attrs:{"total-rows":e.totalRows,"per-page":e.perPage},model:{value:e.currentPage,callback:function(t){e.currentPage=t},expression:"currentPage"}})],1),e._v(" "),r("b-col",[r("b-form-group",{staticClass:"mb-0",attrs:{"label-cols-sm":"3",label:"Nombre par page"}},[r("b-form-select",{attrs:{options:e.pageOptions},model:{value:e.perPage,callback:function(t){e.perPage=t},expression:"perPage"}})],1)],1)],1)],1):e._e()],1)},[],!1,null,null,null);t.default=component.exports}}]);