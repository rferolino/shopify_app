(function() {
  function ITPHelper(opts) {
    this.itpContent = document.querySelector('#TopLevelInteractionContent');
    this.itpAction = document.querySelector('#TopLevelInteractionButton');
    this.redirectUrl = opts.redirectUrl;
  }
  
  ITPHelper.prototype.redirect = function() {
    sessionStorage.setItem('shopify.top_level_interaction', 'true');
    window.location.href = this.redirectUrl;
  }
  
  ITPHelper.prototype.userAgentIsAffected = function() {
    if (navigator.userAgent.indexOf('com.jadedpixel.pos') !== -1) {
      return false;
    }
  
    if (navigator.userAgent.indexOf('Shopify Mobile/iOS') !== -1) {
      return false;
    }
  
    return Boolean(document.hasStorageAccess);
  }
  
  ITPHelper.prototype.canPartitionCookies = function() {
    var versionRegEx = /Version\/12\.0\.?\d? Safari/;
    return versionRegEx.test(navigator.userAgent);
  }
  
  ITPHelper.prototype.setUpContent = function(onClick) {
    this.itpContent.style.display = 'block';
    this.itpAction.addEventListener('click', this.redirect.bind(this));
  }
  
  ITPHelper.prototype.execute = function() {
    if (!this.itpContent) {
      return;
    }
  
    if (this.userAgentIsAffected()) {
      this.setUpContent();
    } else {
      this.redirect();
    }
  }

  this.ITPHelper = ITPHelper;
})(window);