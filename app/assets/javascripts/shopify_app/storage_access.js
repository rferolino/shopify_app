var ACCESS_GRANTED_STATUS = 'access granted';
var ACCESS_DENIED_STATUS = 'access denied';

function StorageAccessHelper(redirectData) {
  this.redirectData = redirectData;
}

StorageAccessHelper.prototype.setNormalizedLink = function(storageAccessStatus) {
  return storageAccessStatus === ACCESS_GRANTED_STATUS ? this.redirectData.hasStorageAccessUrl : this.redirectData.doesNotHaveStorageAccessUrl;
}

StorageAccessHelper.prototype.redirectToAppTLD = function(storageAccessStatus) {
  var normalizedLink = document.createElement('a');

  normalizedLink.href = this.setNormalizedLink(storageAccessStatus);

  data = JSON.stringify({
    message: 'Shopify.API.remoteRedirect',
    data: {
      location: normalizedLink.href,
    }
  });
  window.parent.postMessage(data, this.redirectData.myshopifyUrl);
}

StorageAccessHelper.prototype.redirectToAppsIndex = function() {
  window.parent.location.href = this.redirectData.myshopifyUrl + '/admin/apps';
}

StorageAccessHelper.prototype.redirectToAppHome = function() {
  window.location.href = this.redirectData.appHomeUrl;
}

StorageAccessHelper.prototype.grantedStorageAccess = function() {
  sessionStorage.setItem('shopify.granted_storage_access', 'true');
  document.cookie = 'shopify.granted_storage_access=true';
  this.redirectToAppHome();
}

StorageAccessHelper.prototype.handleRequestStorageAccess = function() {
  return document.requestStorageAccess().then(this.grantedStorageAccess.bind(this), this.redirectToAppsIndex.bind(this, ACCESS_DENIED_STATUS));
}

StorageAccessHelper.prototype.setupRequestStorageAccess = function() {
  const requestContent = document.querySelector('#RequestStorageAccess');
  const requestButton = document.querySelector('#TriggerAllowCookiesPrompt');

  requestButton.addEventListener('click', this.handleRequestStorageAccess.bind(this));
  requestContent.style.display = 'block';
}

StorageAccessHelper.prototype.handleHasStorageAccess = function() {
  if (sessionStorage.getItem('shopify.granted_storage_access')) {
    // If app was classified by ITP and used Storage Access API to acquire access
    this.redirectToAppHome();
  } else {
    // If app has not been classified by ITP and still has storage access
    this.redirectToAppTLD(ACCESS_GRANTED_STATUS);
  }
}

StorageAccessHelper.prototype.handleGetStorageAccess = function() {
  if (sessionStorage.getItem('shopify.top_level_interaction')) {
    // If merchant has been redirected to interact with TLD (requirement for prompting request to gain storage access)
    this.setupRequestStorageAccess();
  } else {
    // If merchant has not been redirected to interact with TLD (requirement for prompting request to gain storage access)
    this.redirectToAppTLD(ACCESS_DENIED_STATUS);
  }
}

StorageAccessHelper.prototype.manageStorageAccess = function() {
  return document.hasStorageAccess().then(function(hasAccess) {
    if (hasAccess) {
      this.handleHasStorageAccess();
    } else {
      this.handleGetStorageAccess();
    }
  }.bind(this));
}

StorageAccessHelper.prototype.execute = function() {
  if (ITPHelper.prototype.canPartitionCookies()) {
    this.setUpCookiePartitioning();
    return;
  }

  if (ITPHelper.prototype.userAgentIsAffected()) {
    this.manageStorageAccess();
  } else {
    this.grantedStorageAccess();
  }
}

/* ITP 2.0 solution: handles cookie partitioning */
StorageAccessHelper.prototype.setUpHelper = function() {
  return new ITPHelper({redirectUrl: window.shopOrigin + "/admin/apps/" + window.apiKey});
}

StorageAccessHelper.prototype.setCookieAndRedirect = function() {
  document.cookie = "shopify.cookies_persist=true";
  var helper = this.setUpHelper();
  helper.redirect();
}

StorageAccessHelper.prototype.setUpCookiePartitioning = function() {
  var itpContent = document.querySelector('#CookiePartitionPrompt');
  itpContent.style.display = 'block';

  var button = document.querySelector('#AcceptCookies');
  button.addEventListener('click', this.setCookieAndRedirect.bind(this));
}
